"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const titles: Record<string, { title: string; sub: string }> = {
  "/overview": { title: "Overview", sub: "Your dashboard at a glance" },
  "/payments": { title: "Payments", sub: "Track and manage transactions" },
  "/projects": { title: "Projects", sub: "Manage projects and tasks" },
  "/users": { title: "Users", sub: "Manage your team" },
  "/settings": { title: "Settings", sub: "Configure your portal" },
};

export function Header() {
  const pathname = usePathname();
  const page =
    titles[pathname] ||
    Object.entries(titles).find(([k]) => pathname.startsWith(k + "/"))?.[1] ||
    { title: "Dashboard", sub: "" };

  return (
    <header className="flex h-[60px] items-center justify-between border-b border-border/60 bg-card/50 backdrop-blur-sm px-7">
      <div className="min-w-0">
        <h1 className="text-[15px] font-semibold text-foreground tracking-tight">{page.title}</h1>
        {page.sub && (
          <p className="text-[11.5px] text-muted-foreground mt-0.5">{page.sub}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Search className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </Button>
        <div className="mx-1.5 h-5 w-px bg-border" />
        <ThemeToggle />
      </div>
    </header>
  );
}
