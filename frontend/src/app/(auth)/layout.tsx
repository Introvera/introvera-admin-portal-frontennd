"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading, emailVerified } = useAuth();
  const router = useRouter();

  // Only redirect if authenticated AND email is verified.
  // Unverified users stay on auth pages (e.g. /verify-email).
  useEffect(() => {
    if (!loading && firebaseUser && emailVerified) {
      router.replace("/overview");
    }
  }, [loading, firebaseUser, emailVerified, router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      {/* Subtle decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-primary/[0.04] blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 h-[500px] w-[500px] rounded-full bg-primary/[0.03] blur-3xl" />
      </div>
      <div className="relative w-full max-w-sm">{children}</div>
    </div>
  );
}
