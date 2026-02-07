"use client";

import { useState, useEffect } from "react";
import type { CreateProject, Project } from "@/types/project";
import { PROJECT_STATUSES, PROJECT_PRIORITIES } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface Props {
  initialData?: Project | null;
  onSubmit: (data: CreateProject) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
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
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Project Name <span className="text-destructive">*</span></Label>
          <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="My Project" className={errors.name ? "border-destructive" : ""} />
          {errors.name && <p className="text-[12px] text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Project description..." />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientName">Client Name</Label>
          <Input id="clientName" value={form.clientName} onChange={(e) => set("clientName", e.target.value)} placeholder="Client name" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientEmail">Client Email</Label>
          <Input id="clientEmail" type="email" value={form.clientEmail} onChange={(e) => set("clientEmail", e.target.value)} placeholder="client@example.com" className={errors.clientEmail ? "border-destructive" : ""} />
          {errors.clientEmail && <p className="text-[12px] text-destructive">{errors.clientEmail}</p>}
        </div>

        <div className="space-y-2">
          <Label>Status <span className="text-destructive">*</span></Label>
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{PROJECT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priority <span className="text-destructive">*</span></Label>
          <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{PROJECT_PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="e.g. Web Development" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget">Budget</Label>
          <Input id="budget" type="number" step="0.01" value={form.budget ?? ""} onChange={(e) => set("budget", e.target.value ? parseFloat(e.target.value) : undefined)} placeholder="0.00" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline</Label>
          <Input id="deadline" type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
        </div>
      </div>

      <Separator />

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData ? "Update Project" : "Create Project"}
        </Button>
      </div>
    </form>
  );
}
