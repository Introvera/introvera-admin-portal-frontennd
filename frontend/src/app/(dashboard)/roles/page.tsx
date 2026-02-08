"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Loader2, Shield, Plus, ChevronRight, Key, Pencil, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { adminService } from "@/services/authService";
import type { RoleDto, PermissionDto } from "@/types/auth";

export default function RolesPage() {
  return (
    <PermissionGuard superAdminOnly>
      <RolesContent />
    </PermissionGuard>
  );
}

function RolesContent() {
  const [tab, setTab] = useState<"roles" | "permissions">("roles");
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [permissions, setPermissions] = useState<PermissionDto[]>([]);
  const [loading, setLoading] = useState(true);

  // ─── Role dialogs ─────────────────────────────────
  const [editRole, setEditRole] = useState<RoleDto | null>(null);
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [showCreateRole, setShowCreateRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRolePermIds, setNewRolePermIds] = useState<string[]>([]);
  const [creatingRole, setCreatingRole] = useState(false);

  // ─── Permission dialogs ───────────────────────────
  const [showPermDialog, setShowPermDialog] = useState(false);
  const [editPerm, setEditPerm] = useState<PermissionDto | null>(null);
  const [permKey, setPermKey] = useState("");
  const [permDesc, setPermDesc] = useState("");
  const [permGroup, setPermGroup] = useState("");
  const [savingPerm, setSavingPerm] = useState(false);
  const [deletingPermId, setDeletingPermId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [rolesData, permsData] = await Promise.all([
        adminService.getRoles(),
        adminService.getPermissions(),
      ]);
      setRoles(rolesData);
      setPermissions(permsData);
    } catch {
      toast.error("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Role handlers ────────────────────────────────
  const openEditRole = (role: RoleDto) => {
    setEditRole(role);
    setSelectedPermIds(role.permissions.map((p) => p.id));
  };

  const handleSaveRolePerms = async () => {
    if (!editRole) return;
    setSaving(true);
    try {
      await adminService.updateRolePermissions(editRole.id, selectedPermIds);
      toast.success(`Permissions updated for ${editRole.name}`);
      setEditRole(null);
      await loadData();
    } catch { toast.error("Failed to update permissions."); }
    finally { setSaving(false); }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) { toast.error("Role name is required."); return; }
    setCreatingRole(true);
    try {
      await adminService.createRole({ name: newRoleName, description: newRoleDesc || undefined, permissionIds: newRolePermIds });
      toast.success(`Role "${newRoleName}" created.`);
      setShowCreateRole(false); setNewRoleName(""); setNewRoleDesc(""); setNewRolePermIds([]);
      await loadData();
    } catch (err: unknown) { toast.error((err as { message?: string })?.message || "Failed to create role."); }
    finally { setCreatingRole(false); }
  };

  const togglePerm = (id: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  // ─── Permission handlers ──────────────────────────
  const openCreatePerm = () => {
    setEditPerm(null);
    setPermKey(""); setPermDesc(""); setPermGroup("");
    setShowPermDialog(true);
  };

  const openEditPerm = (perm: PermissionDto) => {
    setEditPerm(perm);
    setPermKey(perm.key); setPermDesc(perm.description || ""); setPermGroup(perm.group || "");
    setShowPermDialog(true);
  };

  const handleSavePerm = async () => {
    if (!permKey.trim()) { toast.error("Permission key is required."); return; }
    setSavingPerm(true);
    try {
      if (editPerm) {
        await adminService.updatePermission(editPerm.id, { key: permKey, description: permDesc || undefined, group: permGroup || undefined });
        toast.success(`Permission "${permKey}" updated.`);
      } else {
        await adminService.createPermission({ key: permKey, description: permDesc || undefined, group: permGroup || undefined });
        toast.success(`Permission "${permKey}" created.`);
      }
      setShowPermDialog(false);
      await loadData();
    } catch (err: unknown) { toast.error((err as { message?: string })?.message || "Failed to save permission."); }
    finally { setSavingPerm(false); }
  };

  const handleDeletePerm = async (id: string) => {
    setDeletingPermId(id);
    try {
      await adminService.deletePermission(id);
      toast.success("Permission deleted.");
      await loadData();
    } catch { toast.error("Failed to delete permission."); }
    finally { setDeletingPermId(null); }
  };

  // Group permissions
  const grouped = permissions.reduce<Record<string, PermissionDto[]>>((acc, p) => {
    const g = p.group || "Other";
    if (!acc[g]) acc[g] = [];
    acc[g].push(p);
    return acc;
  }, {});

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
          <h2 className="text-lg font-semibold tracking-tight">Roles & Permissions</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Configure roles and their permissions</p>
        </div>
        <div className="flex gap-2">
          {tab === "permissions" && (
            <Button className="gap-2" onClick={openCreatePerm}>
              <Plus className="h-4 w-4" /> New Permission
            </Button>
          )}
          {tab === "roles" && (
            <Button className="gap-2" onClick={() => setShowCreateRole(true)}>
              <Plus className="h-4 w-4" /> New Role
            </Button>
          )}
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg border p-1 w-fit">
        <button
          onClick={() => setTab("roles")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-[13px] font-medium transition-colors ${
            tab === "roles" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Shield className="h-4 w-4" /> Roles
        </button>
        <button
          onClick={() => setTab("permissions")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-[13px] font-medium transition-colors ${
            tab === "permissions" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Key className="h-4 w-4" /> Permissions
        </button>
      </div>

      {/* ════════════ ROLES TAB ════════════ */}
      {tab === "roles" && (
        <div className="grid gap-4 md:grid-cols-2">
          {roles.map((role) => (
            <Card key={role.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => openEditRole(role)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-semibold">{role.name}</h3>
                      <p className="text-[12px] text-muted-foreground">
                        {role.userCount} user{role.userCount !== 1 ? "s" : ""} &middot; {role.permissions.length} permission{role.permissions.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground mt-1" />
                </div>
                {role.description && (
                  <p className="mt-3 text-[12.5px] text-muted-foreground">{role.description}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-1">
                  {role.permissions.slice(0, 5).map((p) => (
                    <Badge key={p.id} variant="secondary" className="text-[10px]">{p.key}</Badge>
                  ))}
                  {role.permissions.length > 5 && (
                    <Badge variant="outline" className="text-[10px]">+{role.permissions.length - 5} more</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ════════════ PERMISSIONS TAB ════════════ */}
      {tab === "permissions" && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Group</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((perm) => (
                <TableRow key={perm.id}>
                  <TableCell className="font-mono text-[12.5px] font-medium">{perm.key}</TableCell>
                  <TableCell className="text-[12.5px] text-muted-foreground">{perm.description || "—"}</TableCell>
                  <TableCell>
                    {perm.group ? (
                      <Badge variant="secondary" className="text-[10px]">{perm.group}</Badge>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditPerm(perm)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDeletePerm(perm.id)}
                        disabled={deletingPermId === perm.id}
                      >
                        {deletingPermId === perm.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Trash2 className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* ─── Edit Role Permissions Dialog ────────────── */}
      <Dialog open={!!editRole} onOpenChange={() => setEditRole(null)}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Permissions — {editRole?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {Object.entries(grouped).map(([group, perms]) => (
              <div key={group}>
                <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group}</p>
                <div className="space-y-1.5">
                  {perms.map((perm) => (
                    <label key={perm.id} className="flex items-center gap-3 rounded-md border px-3 py-2 cursor-pointer hover:bg-accent/50 transition-colors">
                      <input type="checkbox" checked={selectedPermIds.includes(perm.id)} onChange={() => togglePerm(perm.id, selectedPermIds, setSelectedPermIds)} className="h-3.5 w-3.5 rounded border-input accent-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[12.5px] font-medium">{perm.key}</p>
                        {perm.description && <p className="text-[11px] text-muted-foreground">{perm.description}</p>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRole(null)}>Cancel</Button>
            <Button onClick={handleSaveRolePerms} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Create Role Dialog ──────────────────────── */}
      <Dialog open={showCreateRole} onOpenChange={setShowCreateRole}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader><DialogTitle>Create Role</DialogTitle></DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="space-y-2">
              <Label className="text-[13px]">Role name</Label>
              <Input placeholder="e.g. Editor" className="h-10" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} disabled={creatingRole} />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px]">Description</Label>
              <Input placeholder="What this role does..." className="h-10" value={newRoleDesc} onChange={(e) => setNewRoleDesc(e.target.value)} disabled={creatingRole} />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px]">Permissions</Label>
              {Object.entries(grouped).map(([group, perms]) => (
                <div key={group}>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 mt-3">{group}</p>
                  <div className="space-y-1">
                    {perms.map((perm) => (
                      <label key={perm.id} className="flex items-center gap-3 rounded-md border px-3 py-2 cursor-pointer hover:bg-accent/50 transition-colors">
                        <input type="checkbox" checked={newRolePermIds.includes(perm.id)} onChange={() => togglePerm(perm.id, newRolePermIds, setNewRolePermIds)} className="h-3.5 w-3.5 rounded border-input accent-primary" />
                        <span className="text-[12.5px]">{perm.key}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateRole(false)}>Cancel</Button>
            <Button onClick={handleCreateRole} disabled={creatingRole}>
              {creatingRole ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Create/Edit Permission Dialog ───────────── */}
      <Dialog open={showPermDialog} onOpenChange={setShowPermDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editPerm ? "Edit Permission" : "New Permission"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[13px]">Permission key</Label>
              <Input placeholder="e.g. payments.edit" className="h-10 font-mono" value={permKey} onChange={(e) => setPermKey(e.target.value)} disabled={savingPerm} />
              <p className="text-[11px] text-muted-foreground">Use format: module.action (e.g. payments.view, payments.edit)</p>
            </div>
            <div className="space-y-2">
              <Label className="text-[13px]">Description</Label>
              <Input placeholder="What this permission allows..." className="h-10" value={permDesc} onChange={(e) => setPermDesc(e.target.value)} disabled={savingPerm} />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px]">Group</Label>
              <Input placeholder="e.g. Payments" className="h-10" value={permGroup} onChange={(e) => setPermGroup(e.target.value)} disabled={savingPerm} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPermDialog(false)}>Cancel</Button>
            <Button onClick={handleSavePerm} disabled={savingPerm}>
              {savingPerm ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editPerm ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
