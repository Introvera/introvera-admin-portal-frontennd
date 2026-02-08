"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Requires Firebase authentication + verified email + loaded backend profile.
 * - Shows a full-screen loader until everything is resolved.
 * - Redirects to /login if not authenticated.
 * - Redirects to /verify-email if email is not verified.
 * - Viewer-only users are locked to /welcome-request-access.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { firebaseUser, loading, appUser, emailVerified } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isViewerOnly =
    appUser &&
    appUser.roles.length === 1 &&
    appUser.roles[0] === "Viewer";

  const isOnWelcomePage = pathname === "/welcome-request-access";

  // Not authenticated -> /login
  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.replace("/login");
    }
  }, [loading, firebaseUser, router]);

  // Authenticated but email not verified -> /verify-email
  useEffect(() => {
    if (!loading && firebaseUser && !emailVerified) {
      router.replace("/verify-email");
    }
  }, [loading, firebaseUser, emailVerified, router]);

  // Viewer lockdown -> /welcome-request-access
  useEffect(() => {
    if (appUser && isViewerOnly && !isOnWelcomePage) {
      router.replace("/welcome-request-access");
    }
  }, [appUser, isViewerOnly, isOnWelcomePage, router]);

  // Loader: waiting for auth, verification, or profile
  if (loading || !firebaseUser || !emailVerified || (firebaseUser && emailVerified && !appUser)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Viewer on wrong page -> will redirect, render nothing
  if (isViewerOnly && !isOnWelcomePage) {
    return null;
  }

  return <>{children}</>;
}
