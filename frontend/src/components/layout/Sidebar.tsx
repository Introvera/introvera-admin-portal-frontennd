"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, CreditCard, Users, Settings,
  PanelLeftClose, PanelLeft, ChevronDown, Plus, List, FolderKanban,
  LogOut, Shield, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/components/providers/AuthProvider";
import { signOut } from "@/lib/firebase";

// ─── Navigation config with required permissions ────────────
interface NavChild {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
  superAdminOnly?: boolean;
  children?: NavChild[];
}

const navItems: NavItem[] = [
  {
    label: "Overview",
    href: "/overview",
    icon: LayoutDashboard,
    permission: "dashboard.read",
  },
  {
    label: "Payments",
    href: "/payments",
    icon: CreditCard,
    permission: "payments.read",
    children: [
      { label: "All Records", href: "/payments", icon: List, permission: "payments.read" },
      { label: "New Record", href: "/payments/new", icon: Plus, permission: "payments.create" },
    ],
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderKanban,
    permission: "projects.read",
    children: [
      { label: "All Projects", href: "/projects", icon: List, permission: "projects.read" },
      { label: "New Project", href: "/projects/new", icon: Plus, permission: "projects.create" },
    ],
  },
  {
    label: "Users",
    href: "/users",
    icon: Users,
    permission: "users.read",
  },
  {
    label: "Roles & Permissions",
    href: "/roles",
    icon: Shield,
    superAdminOnly: true,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    permission: "settings.read",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { appUser, can, isSuperAdmin } = useAuth();
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const expanded = pinned || hovered;

  const toggleMenu = (href: string) => {
    setOpenMenus((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  const isActiveRoute = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  // Filter nav items based on permissions
  const visibleItems = navItems.filter((item) => {
    if (item.superAdminOnly && !isSuperAdmin) return false;
    if (item.permission && !can(item.permission)) return false;
    return true;
  });

  const userInitial = (appUser?.displayName || appUser?.email || "U")[0].toUpperCase();
  const userName = appUser?.displayName || "User";
  const userEmail = appUser?.email || "";

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex h-screen flex-col bg-sidebar transition-[width] duration-300 ease-in-out overflow-hidden",
        expanded ? "w-[250px]" : "w-[68px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-[60px] items-center px-[14px] gap-2 overflow-hidden">
        <div className={cn("shrink-0 transition-opacity duration-200", expanded ? "opacity-0 w-0" : "opacity-100 w-10")}>
          <Logo variant="mark" forceDark height={30} />
        </div>
        <div className={cn("shrink-0 transition-opacity duration-200", expanded ? "opacity-100" : "opacity-0 w-0")}>
          <Logo variant="full" forceDark height={26} />
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden px-3 py-4">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.href);
          const hasChildren = item.children && item.children.length > 0;
          const isOpen = openMenus[item.href] && expanded;

          // Filter children by permission
          const visibleChildren = item.children?.filter(
            (child) => !child.permission || can(child.permission)
          );

          if (hasChildren && visibleChildren && visibleChildren.length > 0) {
            return (
              <div key={item.href}>
                <button
                  onClick={() => { if (expanded) toggleMenu(item.href); }}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                    isActive
                      ? "bg-sidebar-accent/15 text-sidebar-accent"
                      : "text-sidebar-muted-foreground hover:bg-sidebar-muted hover:text-sidebar-foreground"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-sidebar-accent" />
                  )}
                  <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-sidebar-accent" : "")} />
                  <span
                    className={cn(
                      "flex-1 whitespace-nowrap text-left transition-[opacity] duration-200",
                      expanded ? "opacity-100" : "opacity-0"
                    )}
                  >
                    {item.label}
                  </span>
                  {expanded && (
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 transition-transform duration-200 text-sidebar-muted-foreground",
                        isOpen ? "rotate-0" : "-rotate-90"
                      )}
                    />
                  )}
                </button>

                <div
                  className={cn(
                    "overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out",
                    isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="ml-[18px] mt-1 space-y-0.5 border-l border-sidebar-border/60 pl-3">
                    {visibleChildren.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = isActiveRoute(child.href, true);
                      return (
                        <Link
                          key={child.href + child.label}
                          href={child.href}
                          className={cn(
                            "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[12.5px] font-medium transition-all duration-150",
                            isChildActive
                              ? "text-sidebar-accent bg-sidebar-accent/10"
                              : "text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-muted/50"
                          )}
                        >
                          <ChildIcon className="h-[14px] w-[14px] shrink-0" />
                          <span className="whitespace-nowrap">{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                isActive
                  ? "bg-sidebar-accent/15 text-sidebar-accent"
                  : "text-sidebar-muted-foreground hover:bg-sidebar-muted hover:text-sidebar-foreground"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-sidebar-accent" />
              )}
              <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-sidebar-accent" : "")} />
              <span
                className={cn(
                  "whitespace-nowrap transition-[opacity] duration-200",
                  expanded ? "opacity-100" : "opacity-0"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 h-px bg-sidebar-border" />

      {/* Pin toggle */}
      <div className="flex px-3 py-2">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-muted",
            expanded ? "ml-auto" : "mx-auto"
          )}
          onClick={() => setPinned(!pinned)}
        >
          {pinned ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* User */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="relative shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent/20 text-xs font-semibold text-sidebar-accent">
              {userInitial}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full border-2 border-sidebar bg-emerald-400" />
          </div>
          <div
            className={cn(
              "flex-1 min-w-0 transition-[opacity] duration-200",
              expanded ? "opacity-100" : "opacity-0"
            )}
          >
            <p className="text-[13px] font-medium text-sidebar-foreground truncate">{userName}</p>
            <p className="text-[11px] text-sidebar-muted-foreground truncate">{userEmail}</p>
          </div>
          {expanded && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-muted"
              onClick={handleSignOut}
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
