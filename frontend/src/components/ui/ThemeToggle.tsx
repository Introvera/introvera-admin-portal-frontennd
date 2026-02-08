"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex h-8 w-14 items-center rounded-full bg-muted p-1">
        <div className="h-6 w-6 rounded-full" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    document.documentElement.classList.add("transitioning");
    setTheme(isDark ? "light" : "dark");
    setTimeout(() => document.documentElement.classList.remove("transitioning"), 350);
  };

  return (
    <button
      onClick={handleToggle}
      className="relative flex h-8 w-14 items-center rounded-full bg-muted p-1 transition-colors duration-200"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Sliding indicator */}
      <span
        className={cn(
          "absolute left-1 top-1 h-6 w-6 rounded-full bg-background shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          isDark ? "translate-x-6" : "translate-x-0"
        )}
      />
      {/* Sun icon */}
      <span className={cn(
        "relative z-10 flex h-6 w-6 items-center justify-center transition-colors duration-200",
        !isDark ? "text-amber-500" : "text-muted-foreground/60"
      )}>
        <Sun className="h-3.5 w-3.5" />
      </span>
      {/* Moon icon */}
      <span className={cn(
        "relative z-10 flex h-6 w-6 items-center justify-center transition-colors duration-200",
        isDark ? "text-blue-400" : "text-muted-foreground/60"
      )}>
        <Moon className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}
