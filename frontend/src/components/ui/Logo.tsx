"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** "full" shows mark + text, "mark" shows only the icon */
  variant?: "full" | "mark";
  /** Force a specific color mode instead of auto-detecting */
  forceDark?: boolean;
  className?: string;
  /** Height in pixels (width is auto) */
  height?: number;
}

export function Logo({ variant = "full", forceDark, className, height = 28 }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Before mount, render a placeholder to avoid layout shift
  if (!mounted) {
    return (
      <div
        className={cn("shrink-0", className)}
        style={{ height, width: variant === "mark" ? height : height * 5 }}
      />
    );
  }

  const isDark = forceDark ?? resolvedTheme === "dark";

  if (variant === "mark") {
    return (
      <Image
        src={isDark ? "/logo-mark-inverted.svg" : "/logo-mark.svg"}
        alt="Introvera"
        width={Math.round(height * 1.04)}
        height={height}
        className={cn("shrink-0 object-contain", className)}
        priority
      />
    );
  }

  return (
    <Image
      src={isDark ? "/logo-color-inverted.svg" : "/logo-color.svg"}
      alt="Introvera"
      width={Math.round(height * 5.06)}
      height={height}
      className={cn("shrink-0 object-contain", className)}
      priority
    />
  );
}
