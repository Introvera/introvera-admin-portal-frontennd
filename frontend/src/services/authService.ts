import { apiClient } from "@/lib/api/client";
import type { UserProfile, AdminUser, RoleDto, PermissionDto, AccessRequestDto } from "@/types/auth";

export const authService = {
  /** Get current user profile with roles + permissions */
  getMe: () => apiClient.get<UserProfile>("/auth/me"),

  /** Sync Firebase user to backend (creates record if not exists) */
  sync: () => apiClient.post<UserProfile>("/auth/sync"),

  /** Submit an access request */
  requestAccess: (message?: string) =>
    apiClient.post<AccessRequestDto>("/auth/request-access", { message }),
};

export const adminService = {
  // ─── Users ────────────────────────────────────────
  getUsers: () => apiClient.get<AdminUser[]>("/admin/users"),

  getUser: (id: string) => apiClient.get<AdminUser>(`/admin/users/${id}`),

  createUser: (data: { email: string; displayName?: string; roleIds: string[] }) =>
    apiClient.post<AdminUser>("/admin/users", data),

  assignRoles: (userId: string, roleIds: string[]) =>
    apiClient.put(`/admin/users/${userId}/roles`, { roleIds }),

  toggleActive: (userId: string, isActive: boolean) =>
    apiClient.put(`/admin/users/${userId}/active`, { isActive }),

  // ─── Roles ────────────────────────────────────────
  getRoles: () => apiClient.get<RoleDto[]>("/admin/roles"),

  getRole: (id: string) => apiClient.get<RoleDto>(`/admin/roles/${id}`),

  createRole: (data: { name: string; description?: string; permissionIds: string[] }) =>
    apiClient.post<RoleDto>("/admin/roles", data),

  updateRolePermissions: (roleId: string, permissionIds: string[]) =>
    apiClient.put(`/admin/roles/${roleId}/permissions`, { permissionIds }),

  // ─── Permissions ──────────────────────────────────
  getPermissions: () => apiClient.get<PermissionDto[]>("/admin/permissions"),

  createPermission: (data: { key: string; description?: string; group?: string }) =>
    apiClient.post<PermissionDto>("/admin/permissions", data),

  updatePermission: (id: string, data: { key: string; description?: string; group?: string }) =>
    apiClient.put<PermissionDto>(`/admin/permissions/${id}`, data),

  deletePermission: (id: string) =>
    apiClient.delete(`/admin/permissions/${id}`),

  // ─── Access Requests ──────────────────────────────
  getAccessRequests: () => apiClient.get<AccessRequestDto[]>("/admin/access-requests"),

  reviewAccessRequest: (id: string, status: string, notes?: string) =>
    apiClient.put(`/admin/access-requests/${id}/review`, { status, notes }),
};
