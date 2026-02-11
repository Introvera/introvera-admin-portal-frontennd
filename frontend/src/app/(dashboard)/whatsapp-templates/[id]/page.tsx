"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { whatsappTemplateService } from "@/services/whatsappTemplateService";
import type { WhatsAppTemplate, UpdateWhatsAppTemplate, TemplateCategory } from "@/types/whatsappTemplate";
import { TEMPLATE_CATEGORIES, CATEGORY_VARIANT } from "@/types/whatsappTemplate";
import { toast } from "sonner";
import { ArrowLeft, Save, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditWhatsAppTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<WhatsAppTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<UpdateWhatsAppTemplate | null>(null);

  const set = <K extends keyof UpdateWhatsAppTemplate>(key: K, value: UpdateWhatsAppTemplate[K]) =>
    setForm((prev) => prev ? { ...prev, [key]: value } : prev);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const t = await whatsappTemplateService.getById(id);
      setData(t);
      setForm({
        templateName: t.templateName, category: t.category, languageCode: t.languageCode,
        description: t.description ?? "", bodyParamCount: t.bodyParamCount,
        exampleVarsJson: t.exampleVarsJson ?? "",
      });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed to load"); router.push("/whatsapp-templates"); }
    finally { setIsLoading(false); }
  }, [id, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (!form) return;
    try {
      setIsSaving(true);
      await whatsappTemplateService.update(id, { ...form, exampleVarsJson: form.exampleVarsJson?.trim() || undefined });
      toast.success("Template updated");
      await fetchData();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setIsSaving(false); }
  };

  const handleToggle = async () => {
    if (!data) return;
    try {
      if (data.isActive) { await whatsappTemplateService.deactivate(id); toast.success("Deactivated"); }
      else { await whatsappTemplateService.activate(id); toast.success("Activated"); }
      await fetchData();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  if (isLoading) return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3"><Skeleton className="h-8 w-8 rounded" /><Skeleton className="h-6 w-48" /></div>
      <Card><CardContent className="space-y-4 p-6">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}</CardContent></Card>
    </div>
  );

  if (!data || !form) return null;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild><Link href="/whatsapp-templates"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight font-mono">{data.templateName}</h2>
              <Badge variant={CATEGORY_VARIANT[data.category]}>{data.category}</Badge>
              <Badge variant={data.isActive ? "default" : "secondary"}>{data.isActive ? "Active" : "Inactive"}</Badge>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleToggle}>
          {data.isActive ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
          {data.isActive ? "Deactivate" : "Activate"}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4"><CardTitle className="text-sm font-medium">Edit Template</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Template Name</label>
              <Input value={form.templateName} onChange={(e) => set("templateName", e.target.value)} className="font-mono" />
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
              <Input value={form.languageCode} onChange={(e) => set("languageCode", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Body Param Count</label>
              <Input type="number" min={0} max={20} value={form.bodyParamCount} onChange={(e) => set("bodyParamCount", Number(e.target.value) || 0)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <Textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} rows={2} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Example Variables (JSON array)</label>
            <Textarea value={form.exampleVarsJson ?? ""} onChange={(e) => set("exampleVarsJson", e.target.value)} rows={2} className="font-mono text-xs" />
          </div>
          <Button className="gap-2 w-full" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
