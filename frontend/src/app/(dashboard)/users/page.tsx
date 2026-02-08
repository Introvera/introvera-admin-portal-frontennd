"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Plus, Users, Loader2, Shield, ShieldCheck, MoreHorizontal,
  UserPlus, CheckCircle2, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { useAuth } from "@/components/providers/AuthProvider";
import { adminService } from "@/services/authService";
import type { AdminUser, RoleDto } from "@/types/auth";

export default function UsersPage() {
  return (
    <PermissionGuard required="users.read">
      <UsersContent />
    </PermissionGuard>
  );
}

function UsersContent() {
  const { isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [assignUser, setAssignUser] = useState<AdminUser | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createName, setCreateName] = useState("");
  const [createRoleIds, setCreateRoleIds] = useState<string[]>([]);
  const [createLoading, setCreateLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [usersData, rolesData] = await Promise.all([
        adminService.getUsers(),
        adminService.getRoles(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Assign Roles ────────────────────────────────
  const openAssign = (user: AdminUser) => {
    setAssignUser(user);
    setSelectedRoleIds(user.roles.map((r) => r.id));
  };

  const handleAssign = async () => {
    if (!assignUser) return;
    setAssignLoading(true);
    try {
      await adminService.assignRoles(assignUser.id, selectedRoleIds);
      toast.success(`Roles updated for ${assignUser.email}`);
      setAssignUser(null);
      await loadData();
    } catch {
      toast.error("Failed to assign roles.");
    } finally {
      setAssignLoading(false);
    }
  };

  const toggleRole = (roleId: string, list: string[], setter: (v: string[]) => void) => {
    setter(
      list.includes(roleId) ? list.filter((id) => id !== roleId) : [...list, roleId]
    );
  };

  // ─── Create User ─────────────────────────────────
  const handleCreate = async () => {
    if (!createEmail) {
      toast.error("Email is required.");
      return;
    }
    setCreateLoading(true);
    try {
      await adminService.createUser({
        email: createEmail,
        displayName: createName || undefined,
        roleIds: createRoleIds,
      });
      toast.success(`User ${createEmail} created.`);
      setShowCreate(false);
      setCreateEmail("");
      setCreateName("");
      setCreateRoleIds([]);
      await loadData();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || "Failed to create user.";
      toast.error(msg);
    } finally {
      setCreateLoading(false);
    }
  };

  // ─── Toggle Active ───────────────────────────────
  const handleToggleActive = async (user: AdminUser) => {
    try {
      await adminService.toggleActive(user.id, !user.isActive);
      toast.success(`User ${user.isActive ? "deactivated" : "activated"}.`);
      await loadData();
    } catch {
      toast.error("Failed to update user status.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Users</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage team members and their roles
          </p>
        </div>
        {isSuperAdmin && (
          <Button className="gap-2" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        )}
      </div>

      {users.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-16">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/8">
              <Users className="h-7 w-7 text-primary/70" />
            </div>
            <h3 className="text-[15px] font-semibold">No users yet</h3>
            <p className="mt-1.5 max-w-xs text-center text-sm text-muted-foreground">
              Users will appear here once they sign up or are created by an admin.
            </p>
            {isSuperAdmin && (
              <Button className="mt-6 gap-2" onClick={() => setShowCreate(true)}>
                <UserPlus className="h-4 w-4" />
                Add your first user
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                {isSuperAdmin && <TableHead className="w-12" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {(user.displayName || user.email)[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium truncate">
                          {user.displayName || "—"}
                        </p>
                        <p className="text-[11.5px] text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role.id} variant={getRoleBadgeVariant(role.name)} className="text-[11px]">
                          {role.name === "SuperAdmin" && <ShieldCheck className="mr-1 h-3 w-3" />}
                          {role.name === "Admin" && <Shield className="mr-1 h-3 w-3" />}
                          {role.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"} className="text-[11px]">
                      {user.isActive ? (
                        <><CheckCircle2 className="mr-1 h-3 w-3" /> Active</>
                      ) : (
                        <><XCircle className="mr-1 h-3 w-3" /> Inactive</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[12.5px] text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openAssign(user)}>
                            Assign Roles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(user)}>
                            {user.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* ─── Assign Roles Dialog ─────────────────────── */}
      <Dialog open={!!assignUser} onOpenChange={() => setAssignUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Roles</DialogTitle>
          </DialogHeader>
          {assignUser && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select roles for <span className="font-medium text-foreground">{assignUser.email}</span>
              </p>
              <div className="space-y-2">
                {roles.map((role) => (
                  <label
                    key={role.id}
                    className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoleIds.includes(role.id)}
                      onChange={() => toggleRole(role.id, selectedRoleIds, setSelectedRoleIds)}
                      className="h-4 w-4 rounded border-input accent-primary"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium">{role.name}</p>
                      {role.description && (
                        <p className="text-[11.5px] text-muted-foreground">{role.description}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={assignLoading}>
              {assignLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Roles
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Create User Dialog ──────────────────────── */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Pre-create a user record. They&apos;ll be linked when they sign up with the same email.
            </p>
            <div className="space-y-2">
              <Label className="text-[13px]">Email address</Label>
              <Input
                type="email"
                placeholder="user@example.com"
                className="h-10"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                disabled={createLoading}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px]">Display name</Label>
              <Input
                type="text"
                placeholder="John Doe"
                className="h-10"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                disabled={createLoading}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px]">Roles</Label>
              <div className="space-y-2">
                {roles.map((role) => (
                  <label
                    key={role.id}
                    className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={createRoleIds.includes(role.id)}
                      onChange={() => toggleRole(role.id, createRoleIds, setCreateRoleIds)}
                      className="h-4 w-4 rounded border-input accent-primary"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium">{role.name}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createLoading}>
              {createLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getRoleBadgeVariant(name: string): "default" | "secondary" | "outline" | "destructive" {
  switch (name) {
    case "SuperAdmin":
      return "destructive";
    case "Admin":
      return "default";
    case "Manager":
      return "secondary";
    default:
      return "outline";
  }
}
