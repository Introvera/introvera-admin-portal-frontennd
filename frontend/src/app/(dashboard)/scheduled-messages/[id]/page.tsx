"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { scheduledMessageService } from "@/services/scheduledMessageService";
import { whatsappTemplateService } from "@/services/whatsappTemplateService";
import type { ScheduledMessage, UpdateScheduledMessage, ScheduleKind, RecipientType } from "@/types/scheduledMessage";
import type { WhatsAppTemplate } from "@/types/whatsappTemplate";
import { SCHEDULE_KINDS, SCHEDULE_STATUS_VARIANT } from "@/types/scheduledMessage";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Pause, Play, Save, Zap, Clock, FileText, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function ScheduledMessageDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const [data, setData] = useState<ScheduledMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(searchParams.get("edit") === "true");
  const [isSaving, setIsSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [form, setForm] = useState<UpdateScheduledMessage | null>(null);

  const set = <K extends keyof UpdateScheduledMessage>(key: K, value: UpdateScheduledMessage[K]) =>
    setForm((prev) => prev ? { ...prev, [key]: value } : prev);

  useEffect(() => {
    whatsappTemplateService.getPaged({ isActive: true, category: "Utility", pageSize: 100 })
      .then((r) => setTemplates(r.items)).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const msg = await scheduledMessageService.getById(id);
      setData(msg);
      setForm({
        title: msg.title, recipientType: msg.recipientType, recipientValue: msg.recipientValue,
        templateId: msg.templateId, templateVarsJson: msg.templateVarsJson ?? "",
        conditionJson: msg.conditionJson ?? "", scheduleKind: msg.scheduleKind,
        sendAtUtc: msg.sendAtUtc ? toLocalDatetime(msg.sendAtUtc) : "",
        delaySeconds: msg.delaySeconds, everyNDays: msg.everyNDays, dayOfMonth: msg.dayOfMonth,
        timeOfDayUtc: msg.timeOfDayUtc ?? "",
        startAtUtc: msg.startAtUtc ? toLocalDatetime(msg.startAtUtc) : "",
        endAtUtc: msg.endAtUtc ? toLocalDatetime(msg.endAtUtc) : "",
        activate: false,
      });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); router.push("/scheduled-messages"); }
    finally { setIsLoading(false); }
  }, [id, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const selTpl = templates.find(t => t.id === form?.templateId);

  const handleSave = async (activate: boolean) => {
    if (!form) return;
    // Validate vars count
    if (selTpl && selTpl.bodyParamCount > 0) {
      try {
        const arr = JSON.parse(form.templateVarsJson?.trim() || "[]");
        if (!Array.isArray(arr) || arr.length !== selTpl.bodyParamCount) {
          toast.error(`Template requires ${selTpl.bodyParamCount} variable(s).`); return;
        }
      } catch { toast.error("Invalid JSON in variables."); return; }
    }
    try {
      setIsSaving(true);
      const payload: UpdateScheduledMessage = {
        ...form, activate,
        sendAtUtc: form.sendAtUtc ? new Date(form.sendAtUtc).toISOString() : undefined,
        startAtUtc: form.startAtUtc ? new Date(form.startAtUtc).toISOString() : undefined,
        endAtUtc: form.endAtUtc ? new Date(form.endAtUtc).toISOString() : undefined,
        templateVarsJson: form.templateVarsJson?.trim() || undefined,
        conditionJson: form.conditionJson?.trim() || undefined,
      };
      await scheduledMessageService.update(id, payload);
      toast.success("Schedule updated");
      setIsEditing(false);
      await fetchData();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    try { setIsDeleting(true); await scheduledMessageService.delete(id); toast.success("Deleted"); router.push("/scheduled-messages"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); } finally { setIsDeleting(false); }
  };
  const handlePause = async () => { try { await scheduledMessageService.pause(id); toast.success("Paused"); await fetchData(); } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); } };
  const handleResume = async () => { try { await scheduledMessageService.resume(id); toast.success("Resumed"); await fetchData(); } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); } };

  const fmtDate = (d?: string) => d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  if (isLoading) return <div className="space-y-5"><div className="flex items-center gap-3"><Skeleton className="h-8 w-8 rounded" /><Skeleton className="h-6 w-48" /></div><Card><CardContent className="space-y-4 p-6">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}</CardContent></Card></div>;
  if (!data || !form) return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild><Link href="/scheduled-messages"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight">{data.title}</h2>
              <Badge variant={SCHEDULE_STATUS_VARIANT[data.status]}>{data.status}</Badge>
              {!data.templateIsActive && <Badge variant="destructive">Template Inactive</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">Created {fmtDate(data.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" asChild><Link href={`/scheduled-messages/${id}/logs`}><FileText className="h-3.5 w-3.5" /> Logs</Link></Button>
          {!isEditing && (<>
            {data.status === "Scheduled" && <Button variant="outline" size="sm" className="gap-1.5" onClick={handlePause}><Pause className="h-3.5 w-3.5" /> Pause</Button>}
            {data.status === "Paused" && <Button variant="outline" size="sm" className="gap-1.5" onClick={handleResume}><Play className="h-3.5 w-3.5" /> Resume</Button>}
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setIsEditing(true)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => setShowDelete(true)}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
          </>)}
          {isEditing && <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setIsEditing(false)}><X className="h-3.5 w-3.5" /> Cancel</Button>}
        </div>
      </div>

      {!data.templateIsActive && (
        <Card className="border-destructive/30 bg-destructive/5"><CardContent className="flex items-center gap-3 py-3">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive">The template &quot;{data.templateName}&quot; is deactivated. Resume and scheduled runs are blocked until it is reactivated.</span>
        </CardContent></Card>
      )}

      {isEditing ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-5">
            <Card><CardHeader className="pb-4"><CardTitle className="text-sm font-medium">Basic</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Title</label><Input value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Recipient Type</label><Select value={form.recipientType} onValueChange={(v) => set("recipientType", v as RecipientType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PhoneNumber">Phone Number</SelectItem><SelectItem value="UserId">User ID</SelectItem></SelectContent></Select></div>
                <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{form.recipientType === "PhoneNumber" ? "Phone" : "User ID"}</label><Input value={form.recipientValue ?? ""} onChange={(e) => set("recipientValue", e.target.value)} /></div>
              </div>
            </CardContent></Card>
            <Card><CardHeader className="pb-4"><CardTitle className="text-sm font-medium">Template</CardTitle></CardHeader><CardContent className="space-y-4">
              <Select value={form.templateId} onValueChange={(v) => set("templateId", v)}>
                <SelectTrigger><SelectValue placeholder="Select template..." /></SelectTrigger>
                <SelectContent>{templates.map(t => <SelectItem key={t.id} value={t.id}><span className="font-mono">{t.templateName}</span> <span className="text-muted-foreground ml-1">({t.bodyParamCount} params)</span></SelectItem>)}</SelectContent>
              </Select>
              {selTpl && selTpl.bodyParamCount > 0 && (
                <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Variables ({selTpl.bodyParamCount})</label><Textarea value={form.templateVarsJson ?? ""} onChange={(e) => set("templateVarsJson", e.target.value)} rows={3} className="font-mono text-xs" /></div>
              )}
            </CardContent></Card>
          </div>
          <div className="space-y-5">
            <Card><CardHeader className="pb-4"><CardTitle className="text-sm font-medium">Schedule</CardTitle></CardHeader><CardContent className="space-y-4">
              <Select value={form.scheduleKind} onValueChange={(v) => set("scheduleKind", v as ScheduleKind)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SCHEDULE_KINDS.map(k => <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>)}</SelectContent></Select>
              <Separator />
              {form.scheduleKind === "OneTime" && <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Send At</label><Input type="datetime-local" value={form.sendAtUtc ?? ""} onChange={(e) => set("sendAtUtc", e.target.value)} /></div>}
              {form.scheduleKind === "Delay" && <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Delay (sec)</label><Input type="number" value={form.delaySeconds ?? ""} onChange={(e) => set("delaySeconds", e.target.value ? Number(e.target.value) : undefined)} /></div>}
              {form.scheduleKind === "IntervalDays" && <><div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Every N Days</label><Input type="number" min={1} value={form.everyNDays ?? ""} onChange={(e) => set("everyNDays", e.target.value ? Number(e.target.value) : undefined)} /></div><div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Time (UTC)</label><Input type="time" value={form.timeOfDayUtc ?? ""} onChange={(e) => set("timeOfDayUtc", e.target.value)} /></div></>}
              {form.scheduleKind === "MonthlyDay" && <><div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Day of Month</label><Input type="number" min={1} max={31} value={form.dayOfMonth ?? ""} onChange={(e) => set("dayOfMonth", e.target.value ? Number(e.target.value) : undefined)} /></div><div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Time (UTC)</label><Input type="time" value={form.timeOfDayUtc ?? ""} onChange={(e) => set("timeOfDayUtc", e.target.value)} /></div></>}
              {(form.scheduleKind === "IntervalDays" || form.scheduleKind === "MonthlyDay") && <><Separator /><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Start</label><Input type="datetime-local" value={form.startAtUtc ?? ""} onChange={(e) => set("startAtUtc", e.target.value)} /></div><div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">End</label><Input type="datetime-local" value={form.endAtUtc ?? ""} onChange={(e) => set("endAtUtc", e.target.value)} /></div></div></>}
            </CardContent></Card>
            <Card><CardHeader className="pb-4"><CardTitle className="text-sm font-medium">Condition</CardTitle></CardHeader><CardContent><Textarea value={form.conditionJson ?? ""} onChange={(e) => set("conditionJson", e.target.value)} rows={3} className="font-mono text-xs" /></CardContent></Card>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2 flex-1" onClick={() => handleSave(false)} disabled={isSaving}><Save className="h-4 w-4" /> Save</Button>
              {(data.status === "Draft" || data.status === "Paused") && <Button className="gap-2 flex-1" onClick={() => handleSave(true)} disabled={isSaving}><Zap className="h-4 w-4" /> Save & Activate</Button>}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-5">
            <Card><CardHeader className="pb-4"><CardTitle className="text-sm font-medium">Basic</CardTitle></CardHeader><CardContent className="space-y-3">
              <InfoRow label="Title" value={data.title} /><InfoRow label="Recipient Type" value={data.recipientType} /><InfoRow label="Recipient" value={data.recipientValue ?? "—"} /><InfoRow label="Created By" value={data.createdBy ?? "—"} />
            </CardContent></Card>
            <Card><CardHeader className="pb-4"><CardTitle className="text-sm font-medium">Template</CardTitle></CardHeader><CardContent className="space-y-3">
              <InfoRow label="Template" value={data.templateName} /><InfoRow label="Language" value={data.languageCode} />
              {data.templateVarsJson && <div className="space-y-1"><p className="text-xs font-medium text-muted-foreground">Variables</p><pre className="rounded-md bg-muted p-2 text-xs font-mono overflow-x-auto">{data.templateVarsJson}</pre></div>}
            </CardContent></Card>
          </div>
          <div className="space-y-5">
            <Card><CardHeader className="pb-4"><CardTitle className="text-sm font-medium">Schedule</CardTitle></CardHeader><CardContent className="space-y-3">
              <InfoRow label="Type" value={SCHEDULE_KINDS.find(k => k.value === data.scheduleKind)?.label ?? data.scheduleKind} />
              {data.scheduleKind === "OneTime" && <InfoRow label="Send At" value={fmtDate(data.sendAtUtc)} />}
              {data.scheduleKind === "Delay" && <InfoRow label="Delay" value={data.delaySeconds ? `${data.delaySeconds}s` : "—"} />}
              {data.scheduleKind === "IntervalDays" && <InfoRow label="Every" value={data.everyNDays ? `${data.everyNDays} days` : "—"} />}
              {data.scheduleKind === "MonthlyDay" && <InfoRow label="Day" value={data.dayOfMonth?.toString() ?? "—"} />}
              {(data.scheduleKind === "IntervalDays" || data.scheduleKind === "MonthlyDay") && <InfoRow label="Time (UTC)" value={data.timeOfDayUtc ?? "09:00"} />}
              <Separator /><div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><div><InfoRow label="Next Run" value={fmtDate(data.nextRunAtUtc)} /><InfoRow label="Last Run" value={fmtDate(data.lastRunAtUtc)} /></div></div>
            </CardContent></Card>
            {data.conditionJson && <Card><CardHeader className="pb-4"><CardTitle className="text-sm font-medium">Condition</CardTitle></CardHeader><CardContent><pre className="rounded-md bg-muted p-2 text-xs font-mono overflow-x-auto">{data.conditionJson}</pre></CardContent></Card>}
          </div>
        </div>
      )}

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete schedule</AlertDialogTitle><AlertDialogDescription>This will permanently delete &quot;{data.title}&quot;.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{isDeleting ? "Deleting..." : "Delete"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-sm"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}</span></div>;
}

function toLocalDatetime(utc: string): string {
  try {
    const d = new Date(utc);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch { return ""; }
}
