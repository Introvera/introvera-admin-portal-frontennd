"use client";

import { useState, useEffect } from "react";
import type { CreatePaymentTransaction, PaymentTransaction } from "@/types/payment";
import { PAYMENT_METHODS, PAYMENT_STATUSES } from "@/types/payment";
import type { Project } from "@/types/project";
import { projectService } from "@/services/projectService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface Props {
  initialData?: PaymentTransaction | null;
  defaultProjectId?: string;
  onSubmit: (data: CreatePaymentTransaction) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PaymentTransactionForm({ initialData, defaultProjectId, onSubmit, onCancel, isLoading = false }: Props) {
  const [form, setForm] = useState<CreatePaymentTransaction>({
    transactionReference: "",
    payerName: "",
    payerEmail: "",
    description: "",
    amount: 0,
    currency: "USD",
    paymentMethod: "Cash",
    status: "Pending",
    transactionDate: new Date().toISOString().slice(0, 16),
    notes: "",
    projectId: defaultProjectId || undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    projectService.getAll().then(setProjects).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        transactionReference: initialData.transactionReference,
        payerName: initialData.payerName,
        payerEmail: initialData.payerEmail || "",
        description: initialData.description || "",
        amount: initialData.amount,
        currency: initialData.currency,
        paymentMethod: initialData.paymentMethod,
        status: initialData.status,
        transactionDate: initialData.transactionDate
          ? new Date(initialData.transactionDate).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        notes: initialData.notes || "",
        projectId: initialData.projectId || undefined,
      });
    }
  }, [initialData]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.transactionReference.trim()) e.transactionReference = "Required";
    if (!form.payerName.trim()) e.payerName = "Required";
    if (form.amount <= 0) e.amount = "Must be greater than 0";
    if (!form.currency.trim()) e.currency = "Required";
    if (form.payerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.payerEmail)) e.payerEmail = "Invalid email";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    await onSubmit({
      ...form,
      transactionDate: form.transactionDate ? new Date(form.transactionDate).toISOString() : undefined,
      payerEmail: form.payerEmail || undefined,
      description: form.description || undefined,
      notes: form.notes || undefined,
      projectId: form.projectId || undefined,
    });
  };

  const set = (name: string, value: string | number | undefined) => {
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => { const n = { ...p }; delete n[name]; return n; });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="transactionReference">Transaction Reference <span className="text-destructive">*</span></Label>
          <Input id="transactionReference" value={form.transactionReference} onChange={(e) => set("transactionReference", e.target.value)} placeholder="TXN-20260207-001" className={errors.transactionReference ? "border-destructive" : ""} />
          {errors.transactionReference && <p className="text-[12px] text-destructive">{errors.transactionReference}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="payerName">Payer Name <span className="text-destructive">*</span></Label>
          <Input id="payerName" value={form.payerName} onChange={(e) => set("payerName", e.target.value)} placeholder="John Doe" className={errors.payerName ? "border-destructive" : ""} />
          {errors.payerName && <p className="text-[12px] text-destructive">{errors.payerName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="payerEmail">Payer Email</Label>
          <Input id="payerEmail" type="email" value={form.payerEmail} onChange={(e) => set("payerEmail", e.target.value)} placeholder="john@example.com" className={errors.payerEmail ? "border-destructive" : ""} />
          {errors.payerEmail && <p className="text-[12px] text-destructive">{errors.payerEmail}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount <span className="text-destructive">*</span></Label>
          <Input id="amount" type="number" step="0.01" min="0.01" value={form.amount} onChange={(e) => set("amount", parseFloat(e.target.value) || 0)} placeholder="0.00" className={errors.amount ? "border-destructive" : ""} />
          {errors.amount && <p className="text-[12px] text-destructive">{errors.amount}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency <span className="text-destructive">*</span></Label>
          <Input id="currency" maxLength={3} value={form.currency} onChange={(e) => set("currency", e.target.value.toUpperCase())} placeholder="USD" className={errors.currency ? "border-destructive" : ""} />
          {errors.currency && <p className="text-[12px] text-destructive">{errors.currency}</p>}
        </div>

        <div className="space-y-2">
          <Label>Payment Method <span className="text-destructive">*</span></Label>
          <Select value={form.paymentMethod} onValueChange={(v) => set("paymentMethod", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{PAYMENT_METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status <span className="text-destructive">*</span></Label>
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{PAYMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="transactionDate">Transaction Date</Label>
          <Input id="transactionDate" type="datetime-local" value={form.transactionDate} onChange={(e) => set("transactionDate", e.target.value)} />
        </div>
      </div>

      {/* Project selector */}
      <div className="space-y-2">
        <Label>Project (optional)</Label>
        <Select value={form.projectId || "none"} onValueChange={(v) => set("projectId", v === "none" ? undefined : v)}>
          <SelectTrigger><SelectValue placeholder="No project" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No project</SelectItem>
            {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Payment for..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Additional notes..." />
      </div>

      <Separator />

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData ? "Update" : "Add Transaction"}
        </Button>
      </div>
    </form>
  );
}
