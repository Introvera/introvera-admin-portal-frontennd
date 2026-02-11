"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { scheduledMessageService } from "@/services/scheduledMessageService";
import { whatsappTemplateService } from "@/services/whatsappTemplateService";
import type { CreateScheduledMessage, ScheduleKind, RecipientType } from "@/types/scheduledMessage";
import type { WhatsAppTemplate } from "@/types/whatsappTemplate";
import { SCHEDULE_KINDS } from "@/types/scheduledMessage";
import { toast } from "sonner";
import { ArrowLeft, Save, Zap, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const defaultForm: CreateScheduledMessage = {
  title: "", recipientType: "PhoneNumber", recipientValue: "",
  templateId: "", templateVarsJson: "", conditionJson: "",
  scheduleKind: "OneTime", sendAtUtc: "", delaySeconds: undefined,
  everyNDays: undefined, dayOfMonth: undefined, timeOfDayUtc: "",
  startAtUtc: "", endAtUtc: "", activate: false,
};

export default function NewScheduledMessagePage() {
  const router = useRouter();
  const [form, setForm] = useState<CreateScheduledMessage>(defaultForm);
  const [isSaving, setIsSaving] = useState(false);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);

  useEffect(() => {
    whatsappTemplateService.getPaged({ isActive: true, category: "Utility", pageSize: 100 })
      .then((r) => setTemplates(r.items))
      .catch(() => toast.error("Failed to load templates"));
  }, []);

  const set = <K extends keyof CreateScheduledMessage>(key: K, value: CreateScheduledMessage[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleTemplateChange = (templateId: string) => {
    set("templateId", templateId);
    const t = templates.find((t) => t.id === templateId) ?? null;
    setSelectedTemplate(t);
    if (t && t.bodyParamCount === 0) set("templateVarsJson", "");
  };

  const validateVars = (): boolean => {
    if (!selectedTemplate || selectedTemplate.bodyParamCount === 0) return true;
    const raw = form.templateVarsJson?.trim();
    if (!raw) { toast.error(`Template requires ${selectedTemplate.bodyParamCount} variable(s). Provide a JSON array.`); return false; }
    try {
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) { toast.error("Variables must be a JSON array."); return false; }
      if (arr.length !== selectedTemplate.bodyParamCount) {
        toast.error(`Template requires exactly ${selectedTemplate.bodyParamCount} variable(s), but you provided ${arr.length}.`);
        return false;
      }
      return true;
    } catch { toast.error("Invalid JSON in template variables."); return false; }
  };

  const handleSubmit = async (activate: boolean) => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (!form.templateId) { toast.error("Select a template"); return; }
    if (!form.recipientValue?.trim()) { toast.error("Recipient is required"); return; }
    if (!validateVars()) return;

    const payload: CreateScheduledMessage = {
      ...form, activate,
      sendAtUtc: form.sendAtUtc ? new Date(form.sendAtUtc).toISOString() : undefined,
      startAtUtc: form.startAtUtc ? new Date(form.startAtUtc).toISOString() : undefined,
      endAtUtc: form.endAtUtc ? new Date(form.endAtUtc).toISOString() : undefined,
      templateVarsJson: form.templateVarsJson?.trim() || undefined,
      conditionJson: form.conditionJson?.trim() || undefined,
    };

    try {
      setIsSaving(true);
      const created = await scheduledMessageService.create(payload);
      toast.success(activate ? "Schedule created and activated" : "Schedule saved as draft");
      router.push(`/scheduled-messages/${created.id}`);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed to create"); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild><Link href="/scheduled-messages"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">New Scheduled Message</h2>
          <p className="text-sm text-muted-foreground">Create a new WhatsApp template message schedule</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-4"><CardTitle className="text-sm font-medium">Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Title *</label>
                <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g., Weekly Promotion Reminder" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Recipient Type</label>
                  <Select value={form.recipientType} onValueChange={(v) => set("recipientType", v as RecipientType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PhoneNumber">Phone Number</SelectItem>
                      <SelectItem value="UserId">User ID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{form.recipientType === "PhoneNumber" ? "Phone (E.164) *" : "User ID *"}</label>
                  <Input value={form.recipientValue ?? ""} onChange={(e) => set("recipientValue", e.target.value)} placeholder={form.recipientType === "PhoneNumber" ? "+1234567890" : "user-uuid"} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4"><CardTitle className="text-sm font-medium">WhatsApp Template</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Template *</label>
                <Select value={form.templateId} onValueChange={handleTemplateChange}>
                  <SelectTrigger><SelectValue placeholder="Select a template..." /></SelectTrigger>
                  <SelectContent>
                    {templates.length === 0 && <SelectItem value="_none" disabled>No active Utility templates</SelectItem>}
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <span className="font-mono">{t.templateName}</span>
                        <span className="text-muted-foreground ml-2">({t.languageCode}, {t.bodyParamCount} params)</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplate && (
                <div className="rounded-md border bg-muted/30 p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">Template Details</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Language:</span> {selectedTemplate.languageCode}</div>
                    <div><span className="text-muted-foreground">Category:</span> <Badge variant="outline" className="text-[10px] h-4">{selectedTemplate.category}</Badge></div>
                    <div><span className="text-muted-foreground">Params:</span> {selectedTemplate.bodyParamCount}</div>
                  </div>
                  {selectedTemplate.description && <p className="text-xs text-muted-foreground">{selectedTemplate.description}</p>}
                  {selectedTemplate.exampleVarsJson && (
                    <div className="text-xs"><span className="text-muted-foreground">Example:</span> <code className="bg-muted px-1 rounded">{selectedTemplate.exampleVarsJson}</code></div>
                  )}
                </div>
              )}

              {selectedTemplate && selectedTemplate.bodyParamCount > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Template Variables (JSON array of {selectedTemplate.bodyParamCount} string{selectedTemplate.bodyParamCount > 1 ? "s" : ""}) *
                  </label>
                  <Textarea value={form.templateVarsJson ?? ""} onChange={(e) => set("templateVarsJson", e.target.value)}
                    placeholder={selectedTemplate.exampleVarsJson || `["value1"${selectedTemplate.bodyParamCount > 1 ? ', "value2"' : ""}]`}
                    rows={3} className="font-mono text-xs" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-4"><CardTitle className="text-sm font-medium">Schedule</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Schedule Type</label>
                <Select value={form.scheduleKind} onValueChange={(v) => set("scheduleKind", v as ScheduleKind)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SCHEDULE_KINDS.map((k) => <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Separator />
              {form.scheduleKind === "OneTime" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Send At (local time, converted to UTC)</label>
                  <Input type="datetime-local" value={form.sendAtUtc ?? ""} onChange={(e) => set("sendAtUtc", e.target.value)} />
                </div>
              )}
              {form.scheduleKind === "Delay" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Delay (seconds)</label>
                  <Input type="number" value={form.delaySeconds ?? ""} onChange={(e) => set("delaySeconds", e.target.value ? Number(e.target.value) : undefined)} placeholder="3600 = 1 hour" />
                </div>
              )}
              {form.scheduleKind === "IntervalDays" && (
                <div className="space-y-4">
                  <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Every N Days</label><Input type="number" min={1} value={form.everyNDays ?? ""} onChange={(e) => set("everyNDays", e.target.value ? Number(e.target.value) : undefined)} placeholder="7" /></div>
                  <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Time of Day (UTC, HH:mm)</label><Input type="time" value={form.timeOfDayUtc ?? ""} onChange={(e) => set("timeOfDayUtc", e.target.value)} /></div>
                </div>
              )}
              {form.scheduleKind === "MonthlyDay" && (
                <div className="space-y-4">
                  <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Day of Month (1–31)</label><Input type="number" min={1} max={31} value={form.dayOfMonth ?? ""} onChange={(e) => set("dayOfMonth", e.target.value ? Number(e.target.value) : undefined)} placeholder="15" /></div>
                  <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Time of Day (UTC, HH:mm)</label><Input type="time" value={form.timeOfDayUtc ?? ""} onChange={(e) => set("timeOfDayUtc", e.target.value)} /></div>
                </div>
              )}
              {(form.scheduleKind === "IntervalDays" || form.scheduleKind === "MonthlyDay") && (
                <><Separator /><div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">Start At (optional)</label><Input type="datetime-local" value={form.startAtUtc ?? ""} onChange={(e) => set("startAtUtc", e.target.value)} /></div>
                  <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">End At (optional)</label><Input type="datetime-local" value={form.endAtUtc ?? ""} onChange={(e) => set("endAtUtc", e.target.value)} /></div>
                </div></>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4"><CardTitle className="text-sm font-medium">Condition (Optional)</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Textarea value={form.conditionJson ?? ""} onChange={(e) => set("conditionJson", e.target.value)} placeholder='{"type": "always"}' rows={3} className="font-mono text-xs" />
              <p className="text-[11px] text-muted-foreground">
                Supported: <code className="rounded bg-muted px-1">always</code>, <code className="rounded bg-muted px-1">never</code>, <code className="rounded bg-muted px-1">dayOfWeek</code>.
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 flex-1" onClick={() => handleSubmit(false)} disabled={isSaving}><Save className="h-4 w-4" /> Save as Draft</Button>
            <Button className="gap-2 flex-1" onClick={() => handleSubmit(true)} disabled={isSaving}><Zap className="h-4 w-4" /> Save & Activate</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
