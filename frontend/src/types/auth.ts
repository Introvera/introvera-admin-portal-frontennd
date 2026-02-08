/** User profile returned by GET /api/auth/me */
export interface UserProfile {
  id: string;
  firebaseUid: string;
  email: string;
  displayName: string | null;
  isActive: boolean;
  createdAt: string;
  roles: string[];
  permissions: string[];
  isSuperAdmin: boolean;
}

/** Admin user list item */
export interface AdminUser {
  id: string;
  email: string;
  displayName: string | null;
  isActive: boolean;
  createdAt: string;
  roles: RoleDto[];
}

export interface RoleDto {
  id: string;
  name: string;
  description: string | null;
  permissions: PermissionDto[];
  userCount: number;
}

export interface PermissionDto {
  id: string;
  key: string;
  description: string | null;
  group: string | null;
}

export interface AccessRequestDto {
  id: string;
  userId: string;
  userEmail: string;
  userDisplayName: string | null;
  message: string | null;
  status: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  createdAt: string;
}
