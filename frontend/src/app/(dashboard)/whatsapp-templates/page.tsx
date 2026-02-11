"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { whatsappTemplateService } from "@/services/whatsappTemplateService";
import type { WhatsAppTemplate, WhatsAppTemplateQueryParams, PaginatedResult } from "@/types/whatsappTemplate";
import { TEMPLATE_CATEGORIES, CATEGORY_VARIANT } from "@/types/whatsappTemplate";
import { PaginationControl } from "@/components/ui/pagination-control";
import { toast } from "sonner";
import { Plus, Pencil, Search, X, SlidersHorizontal, FileCode2, AlertTriangle, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const EMPTY: PaginatedResult<WhatsAppTemplate> = { items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0, hasPreviousPage: false, hasNextPage: false };

export default function WhatsAppTemplatesListPage() {
  const router = useRouter();
  const [result, setResult] = useState<PaginatedResult<WhatsAppTemplate>>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);
  useEffect(() => { setPage(1); }, [categoryFilter, activeFilter]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true); setError(null);
      const q: WhatsAppTemplateQueryParams = {
        page, pageSize,
        search: debouncedSearch || undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        isActive: activeFilter === "all" ? undefined : activeFilter === "true",
      };
      setResult(await whatsappTemplateService.getPaged(q));
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to load"); }
    finally { setIsLoading(false); }
  }, [page, pageSize, debouncedSearch, categoryFilter, activeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggle = async (t: WhatsAppTemplate) => {
    try {
      if (t.isActive) { await whatsappTemplateService.deactivate(t.id); toast.success("Template deactivated"); }
      else { await whatsappTemplateService.activate(t.id); toast.success("Template activated"); }
      await fetchData();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  const clearFilters = () => { setSearch(""); setCategoryFilter("all"); setActiveFilter("all"); };
  const hasFilters = debouncedSearch || categoryFilter !== "all" || activeFilter !== "all";

  return (
    <TooltipProvider delayDuration={0}>
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">WhatsApp Templates</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Register and manage WhatsApp message templates</p>
          </div>
          <Button asChild className="gap-2"><Link href="/whatsapp-templates/new"><Plus className="h-4 w-4" /> New Template</Link></Button>
        </div>

        <Card><CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates..." className="pl-9" />
                {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>}
              </div>
              <Button variant={showFilters ? "secondary" : "outline"} size="sm" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </Button>
            </div>
            {showFilters && (<>
              <Separator />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Category</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem>{TEMPLATE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Status</label>
                  <Select value={activeFilter} onValueChange={setActiveFilter}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="true">Active</SelectItem><SelectItem value="false">Inactive</SelectItem></SelectContent></Select>
                </div>
              </div>
              {hasFilters && <div className="flex justify-end"><Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={clearFilters}><X className="h-3.5 w-3.5" /> Clear</Button></div>}
            </>)}
          </div>
        </CardContent></Card>

        {error && <Card className="border-destructive/30 bg-destructive/5"><CardContent className="flex items-center gap-3 py-3"><AlertTriangle className="h-4 w-4 text-destructive" /><span className="text-sm text-destructive">{error}</span><Button variant="link" size="sm" className="ml-auto text-destructive" onClick={fetchData}>Retry</Button></CardContent></Card>}
        {isLoading && <Card><CardContent className="space-y-4 p-6">{[...Array(4)].map((_, i) => <div key={i} className="flex items-center gap-4"><Skeleton className="h-4 w-40" /><Skeleton className="h-4 w-24" /><Skeleton className="h-6 w-16 rounded-full" /></div>)}</CardContent></Card>}

        {!isLoading && !error && result.totalCount === 0 && (
          <Card className="border-dashed"><CardContent className="flex flex-col items-center py-14">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><FileCode2 className="h-6 w-6 text-primary" /></div>
            <h3 className="text-[15px] font-semibold">{hasFilters ? "No matching templates" : "No templates yet"}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{hasFilters ? "Try adjusting your filters." : "Register your first WhatsApp template."}</p>
            {!hasFilters && <Button asChild className="mt-5 gap-2"><Link href="/whatsapp-templates/new"><Plus className="h-4 w-4" /> New Template</Link></Button>}
          </CardContent></Card>
        )}

        {!isLoading && result.items.length > 0 && (
          <Card>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Template Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Params</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow></TableHeader>
              <TableBody>
                {result.items.map((t) => (
                  <TableRow key={t.id} className="group cursor-pointer" onClick={() => router.push(`/whatsapp-templates/${t.id}`)}>
                    <TableCell>
                      <p className="font-medium font-mono text-sm">{t.templateName}</p>
                      {t.description && <p className="text-xs text-muted-foreground truncate max-w-[250px]">{t.description}</p>}
                    </TableCell>
                    <TableCell><Badge variant={CATEGORY_VARIANT[t.category]}>{t.category}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{t.languageCode}</TableCell>
                    <TableCell className="text-center tabular-nums">{t.bodyParamCount}</TableCell>
                    <TableCell><Badge variant={t.isActive ? "default" : "secondary"}>{t.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                        <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.push(`/whatsapp-templates/${t.id}`)}><Pencil className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent><p>Edit</p></TooltipContent></Tooltip>
                        <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleToggle(t)}>{t.isActive ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}</Button></TooltipTrigger><TooltipContent><p>{t.isActive ? "Deactivate" : "Activate"}</p></TooltipContent></Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Separator />
            <div className="px-4 py-3"><PaginationControl page={result.page} pageSize={result.pageSize} totalCount={result.totalCount} totalPages={result.totalPages} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} /></div>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}
