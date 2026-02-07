"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CreditCard, Users, Settings,
  PanelLeftClose, PanelLeft, ChevronDown, Plus, List, FolderKanban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Overview", href: "/overview", icon: LayoutDashboard },
  {
    label: "Payments",
    href: "/payments",
    icon: CreditCard,
    children: [
      { label: "All Records", href: "/payments", icon: List },
      { label: "New Record", href: "/payments/new", icon: Plus },
    ],
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderKanban,
    children: [
      { label: "All Projects", href: "/projects", icon: List },
      { label: "New Project", href: "/projects/new", icon: Plus },
    ],
  },
  { label: "Users", href: "/users", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
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

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-in-out overflow-hidden",
        expanded ? "w-[240px]" : "w-[68px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-[18px] gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-bold text-primary-foreground">I</span>
        </div>
        <span
          className={cn(
            "whitespace-nowrap text-[15px] font-semibold tracking-tight text-sidebar-foreground transition-[opacity] duration-200",
            expanded ? "opacity-100" : "opacity-0"
          )}
        >
          Introvera
        </span>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.href);
          const hasChildren = item.children && item.children.length > 0;
          const isOpen = openMenus[item.href] && expanded;

          // Parent item with sub-nav
          if (hasChildren) {
            return (
              <div key={item.href}>
                {/* Parent button */}
                <button
                  onClick={() => {
                    if (expanded) toggleMenu(item.href);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-sidebar-muted-foreground hover:bg-sidebar-muted hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-primary" : "")} />
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
                        "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                        isOpen ? "rotate-0" : "-rotate-90"
                      )}
                    />
                  )}
                </button>

                {/* Sub-items */}
                <div
                  className={cn(
                    "overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out",
                    isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="ml-[18px] mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3">
                    {item.children!.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = isActiveRoute(child.href, true);
                      return (
                        <Link
                          key={child.href + child.label}
                          href={child.href}
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                            isChildActive
                              ? "text-primary"
                              : "text-sidebar-muted-foreground hover:text-sidebar-foreground"
                          )}
                        >
                          <ChildIcon className="h-[15px] w-[15px] shrink-0" />
                          <span className="whitespace-nowrap">{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          }

          // Simple nav item (no children)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-muted-foreground hover:bg-sidebar-muted hover:text-sidebar-foreground"
              )}
            >
              <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-primary" : "")} />
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

      <Separator className="bg-sidebar-border" />

      {/* Pin toggle */}
      <div className="flex px-3 py-2">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 text-sidebar-muted-foreground",
            expanded ? "ml-auto" : "mx-auto"
          )}
          onClick={() => setPinned(!pinned)}
        >
          {pinned ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* User */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="relative shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-400 text-xs font-bold text-white">
              A
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full border-2 border-sidebar bg-emerald-500" />
          </div>
          <div
            className={cn(
              "flex-1 truncate transition-[opacity] duration-200",
              expanded ? "opacity-100" : "opacity-0"
            )}
          >
            <p className="text-[13px] font-medium text-sidebar-foreground">Admin</p>
            <p className="text-[11px] text-sidebar-muted-foreground">admin@introvera.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
