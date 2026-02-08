"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { ShieldX } from "lucide-react";

interface PermissionGuardProps {
  children: React.ReactNode;
  /** Required permission key (e.g. "users.read") */
  required?: string;
  /** Required role name */
  role?: string;
  /** If true, requires SuperAdmin */
  superAdminOnly?: boolean;
  /** Custom fallback UI when unauthorized */
  fallback?: React.ReactNode;
}

/**
 * Guards content behind a specific permission, role, or SuperAdmin check.
 * Shows an unauthorized message or custom fallback if the user lacks access.
 */
export function PermissionGuard({
  children,
  required,
  role,
  superAdminOnly = false,
  fallback,
}: PermissionGuardProps) {
  const { can, isRole, isSuperAdmin } = useAuth();

  let hasAccess = true;

  if (superAdminOnly && !isSuperAdmin) {
    hasAccess = false;
  }

  if (required && !can(required)) {
    hasAccess = false;
  }

  if (role && !isRole(role)) {
    hasAccess = false;
  }

  if (!hasAccess) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/8">
          <ShieldX className="h-7 w-7 text-destructive/70" />
        </div>
        <h3 className="text-[15px] font-semibold">Access Denied</h3>
        <p className="mt-1.5 max-w-xs text-center text-sm text-muted-foreground">
          You don&apos;t have permission to view this page. Contact your administrator for access.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
