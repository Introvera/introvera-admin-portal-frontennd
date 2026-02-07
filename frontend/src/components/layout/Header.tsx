"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Separator } from "@/components/ui/separator";

const titles: Record<string, { title: string; sub: string }> = {
  "/overview": { title: "Overview", sub: "Your dashboard at a glance" },
  "/payments": { title: "Payments", sub: "Track and manage transactions" },
  "/projects": { title: "Projects", sub: "Manage projects and tasks" },
  "/users": { title: "Users", sub: "Manage your team" },
  "/settings": { title: "Settings", sub: "Configure your portal" },
};

export function Header() {
  const pathname = usePathname();
  // Match exact or prefix for sub-routes
  const page = titles[pathname] || Object.entries(titles).find(([k]) => pathname.startsWith(k + "/"))?.[1] || { title: "Dashboard", sub: "" };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-7">
      <div>
        <h1 className="text-[15px] font-semibold text-foreground">{page.title}</h1>
        {page.sub && <p className="text-[12px] text-muted-foreground">{page.sub}</p>}
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
