"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { whatsappTemplateService } from "@/services/whatsappTemplateService";
import type { CreateWhatsAppTemplate, TemplateCategory } from "@/types/whatsappTemplate";
import { TEMPLATE_CATEGORIES } from "@/types/whatsappTemplate";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NewWhatsAppTemplatePage() {
  const router = useRouter();
  const [form, setForm] = useState<CreateWhatsAppTemplate>({
    templateName: "", category: "Utility", languageCode: "en_US",
    description: "", bodyParamCount: 0, exampleVarsJson: "", isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const set = <K extends keyof CreateWhatsAppTemplate>(key: K, value: CreateWhatsAppTemplate[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.templateName.trim()) { toast.error("Template name is required"); return; }
    try {
      setIsSaving(true);
      const payload = { ...form, exampleVarsJson: form.exampleVarsJson?.trim() || undefined };
      const created = await whatsappTemplateService.create(payload);
      toast.success("Template created");
      router.push(`/whatsapp-templates/${created.id}`);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed to create"); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild><Link href="/whatsapp-templates"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">New WhatsApp Template</h2>
          <p className="text-sm text-muted-foreground">Register a template that is approved in Meta Business Manager</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4"><CardTitle className="text-sm font-medium">Template Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Template Name *</label>
              <Input value={form.templateName} onChange={(e) => set("templateName", e.target.value)} placeholder="order_confirmation" className="font-mono" />
              <p className="text-[11px] text-muted-foreground">Exact name as registered with Meta.</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <Select value={form.category} onValueChange={(v) => set("category", v as TemplateCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TEMPLATE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Language Code</label>
              <Input value={form.languageCode} onChange={(e) => set("languageCode", e.target.value)} placeholder="en_US" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Body Param Count</label>
              <Input type="number" min={0} max={20} value={form.bodyParamCount} onChange={(e) => set("bodyParamCount", Number(e.target.value) || 0)} />
              <p className="text-[11px] text-muted-foreground">Number of {"{{1}}, {{2}}, ..."} body variables.</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <Textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} placeholder="Sends order confirmation with order ID and delivery date" rows={2} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Example Variables (JSON array)</label>
            <Textarea value={form.exampleVarsJson ?? ""} onChange={(e) => set("exampleVarsJson", e.target.value)} placeholder='["John Doe", "ORD-12345"]' rows={2} className="font-mono text-xs" />
            <p className="text-[11px] text-muted-foreground">Preview values for admin reference.</p>
          </div>
          <Button className="gap-2 w-full" onClick={handleSubmit} disabled={isSaving}>
            <Save className="h-4 w-4" /> Create Template
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
