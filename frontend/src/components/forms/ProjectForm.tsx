"use client";

import { useState, useEffect } from "react";
import type { CreateProject, Project } from "@/types/project";
import { PROJECT_STATUSES, PROJECT_PRIORITIES } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderKanban, User, Settings2, FileText } from "lucide-react";

interface Props {
  initialData?: Project | null;
  onSubmit: (data: CreateProject) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <h3 className="text-[13.5px] font-semibold">{title}</h3>
        <p className="text-[11.5px] text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function ProjectForm({ initialData, onSubmit, onCancel, isLoading = false }: Props) {
  const [form, setForm] = useState<CreateProject>({
    name: "",
    description: "",
    clientName: "",
    clientEmail: "",
    category: "",
    status: "Planning",
    priority: "Medium",
    budget: undefined,
    deadline: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        description: initialData.description || "",
        clientName: initialData.clientName || "",
        clientEmail: initialData.clientEmail || "",
        category: initialData.category || "",
        status: initialData.status,
        priority: initialData.priority,
        budget: initialData.budget ?? undefined,
        deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().slice(0, 10) : "",
      });
    }
  }, [initialData]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (form.clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.clientEmail)) e.clientEmail = "Invalid email";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    await onSubmit({
      ...form,
      description: form.description || undefined,
      clientName: form.clientName || undefined,
      clientEmail: form.clientEmail || undefined,
      category: form.category || undefined,
      budget: form.budget || undefined,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
    });
  };

  const set = (name: string, value: string | number | undefined) => {
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => { const n = { ...p }; delete n[name]; return n; });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Project Info */}
      <Card>
        <CardContent className="p-5">
          <SectionHeader icon={FolderKanban} title="Project Info" description="Basic project details" />
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-[12.5px]">Project Name <span className="text-destructive">*</span></Label>
              <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="My Project" className={errors.name ? "border-destructive" : ""} />
              {errors.name && <p className="text-[11.5px] text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-[12.5px]">Description</Label>
              <Textarea id="description" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe your project..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-[12.5px]">Category</Label>
              <Input id="category" value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="e.g. Web Development" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Details */}
      <Card>
        <CardContent className="p-5">
          <SectionHeader icon={User} title="Client Details" description="Information about the client" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="clientName" className="text-[12.5px]">Client Name</Label>
              <Input id="clientName" value={form.clientName} onChange={(e) => set("clientName", e.target.value)} placeholder="Client name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="clientEmail" className="text-[12.5px]">Client Email</Label>
              <Input id="clientEmail" type="email" value={form.clientEmail} onChange={(e) => set("clientEmail", e.target.value)} placeholder="client@example.com" className={errors.clientEmail ? "border-destructive" : ""} />
              {errors.clientEmail && <p className="text-[11.5px] text-destructive">{errors.clientEmail}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status & Planning */}
      <Card>
        <CardContent className="p-5">
          <SectionHeader icon={Settings2} title="Status & Planning" description="Project status, priority, budget and timeline" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-[12.5px]">Status <span className="text-destructive">*</span></Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PROJECT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12.5px]">Priority <span className="text-destructive">*</span></Label>
              <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PROJECT_PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budget" className="text-[12.5px]">Budget</Label>
              <Input id="budget" type="number" step="0.01" value={form.budget ?? ""} onChange={(e) => set("budget", e.target.value ? parseFloat(e.target.value) : undefined)} placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deadline" className="text-[12.5px]">Deadline</Label>
              <Input id="deadline" type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="min-w-[100px]">Cancel</Button>
        <Button type="submit" disabled={isLoading} className="min-w-[140px]">
          {isLoading ? "Saving..." : initialData ? "Update Project" : "Create Project"}
        </Button>
      </div>
    </form>
  );
}
