"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { scheduledMessageService } from "@/services/scheduledMessageService";
import type { ScheduledMessage, ScheduledMessageQueryParams, PaginatedResult } from "@/types/scheduledMessage";
import { SCHEDULE_STATUSES, SCHEDULE_KINDS, SCHEDULE_STATUS_VARIANT } from "@/types/scheduledMessage";
import { PaginationControl } from "@/components/ui/pagination-control";
import { toast } from "sonner";
import {
  Plus, Trash2, Eye, Pencil, Search, X, SlidersHorizontal,
  MessageSquare, AlertTriangle, Pause, Play, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const EMPTY: PaginatedResult<ScheduledMessage> = {
  items: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 0, hasPreviousPage: false, hasNextPage: false,
};

export default function ScheduledMessagesListPage() {
  const router = useRouter();
  const [result, setResult] = useState<PaginatedResult<ScheduledMessage>>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [kindFilter, setKindFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<ScheduledMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);
  useEffect(() => { setPage(1); }, [statusFilter, kindFilter]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true); setError(null);
      const q: ScheduledMessageQueryParams = {
        page, pageSize,
        search: debouncedSearch || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        scheduleKind: kindFilter !== "all" ? kindFilter : undefined,
      };
      setResult(await scheduledMessageService.getPaged(q));
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to load"); }
    finally { setIsLoading(false); }
  }, [page, pageSize, debouncedSearch, statusFilter, kindFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await scheduledMessageService.delete(deleteTarget.id);
      toast.success("Schedule deleted");
      setDeleteTarget(null);
      await fetchData();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setIsDeleting(false); }
  };

  const handlePause = async (id: string) => {
    try {
      await scheduledMessageService.pause(id);
      toast.success("Schedule paused");
      await fetchData();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  const handleResume = async (id: string) => {
    try {
      await scheduledMessageService.resume(id);
      toast.success("Schedule resumed");
      await fetchData();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  const clearFilters = () => { setSearch(""); setStatusFilter("all"); setKindFilter("all"); };
  const hasFilters = debouncedSearch || statusFilter !== "all" || kindFilter !== "all";
  const fmtDate = (d?: string) => d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <TooltipProvider delayDuration={0}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Scheduled Messages</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Manage WhatsApp template message schedules</p>
          </div>
          <Button asChild className="gap-2"><Link href="/scheduled-messages/new"><Plus className="h-4 w-4" /> New Schedule</Link></Button>
        </div>

        {/* Search & Filters */}
        <Card><CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or template..." className="pl-9" />
                {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>}
              </div>
              <Button variant={showFilters ? "secondary" : "outline"} size="sm" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal className="h-4 w-4" /> Filters
                {hasFilters && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">!</span>}
              </Button>
            </div>
            {showFilters && (<>
              <Separator />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue placeholder="All" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{SCHEDULE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Schedule Type</label>
                  <Select value={kindFilter} onValueChange={setKindFilter}><SelectTrigger><SelectValue placeholder="All" /></SelectTrigger><SelectContent><SelectItem value="all">All types</SelectItem>{SCHEDULE_KINDS.map((k) => <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
              {hasFilters && <div className="flex justify-end"><Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={clearFilters}><X className="h-3.5 w-3.5" /> Clear filters</Button></div>}
            </>)}
          </div>
        </CardContent></Card>

        {/* Error */}
        {error && <Card className="border-destructive/30 bg-destructive/5"><CardContent className="flex items-center gap-3 py-3"><AlertTriangle className="h-4 w-4 text-destructive" /><span className="text-sm text-destructive">{error}</span><Button variant="link" size="sm" className="ml-auto text-destructive" onClick={fetchData}>Retry</Button></CardContent></Card>}

        {/* Loading */}
        {isLoading && <Card><CardContent className="space-y-4 p-6">{[...Array(4)].map((_, i) => <div key={i} className="flex items-center gap-4"><Skeleton className="h-4 w-40" /><Skeleton className="h-4 w-24" /><Skeleton className="h-6 w-16 rounded-full" /><Skeleton className="h-4 w-20" /></div>)}</CardContent></Card>}

        {/* Empty */}
        {!isLoading && !error && result.totalCount === 0 && (
          <Card className="border-dashed"><CardContent className="flex flex-col items-center py-14">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><MessageSquare className="h-6 w-6 text-primary" /></div>
            <h3 className="text-[15px] font-semibold">{hasFilters ? "No matching schedules" : "No schedules yet"}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{hasFilters ? "Try adjusting your filters." : "Create your first scheduled message to get started."}</p>
            {hasFilters ? <Button variant="outline" className="mt-5 gap-2" onClick={clearFilters}><X className="h-4 w-4" /> Clear</Button> : <Button asChild className="mt-5 gap-2"><Link href="/scheduled-messages/new"><Plus className="h-4 w-4" /> New Schedule</Link></Button>}
          </CardContent></Card>
        )}

        {/* Table */}
        {!isLoading && result.items.length > 0 && (
          <Card>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead className="w-[120px]" />
              </TableRow></TableHeader>
              <TableBody>
                {result.items.map((m) => (
                  <TableRow key={m.id} className="group cursor-pointer" onClick={() => router.push(`/scheduled-messages/${m.id}`)}>
                    <TableCell>
                      <p className="font-medium">{m.title}</p>
                      <p className="text-xs text-muted-foreground">{m.recipientType === "PhoneNumber" ? m.recipientValue : `User: ${m.recipientValue}`}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{m.templateName}</TableCell>
                    <TableCell className="text-muted-foreground">{SCHEDULE_KINDS.find(k => k.value === m.scheduleKind)?.label ?? m.scheduleKind}</TableCell>
                    <TableCell><Badge variant={SCHEDULE_STATUS_VARIANT[m.status]}>{m.status}</Badge></TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {m.nextRunAtUtc ? <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{fmtDate(m.nextRunAtUtc)}</span> : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                        <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.push(`/scheduled-messages/${m.id}`)}><Eye className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent><p>View</p></TooltipContent></Tooltip>
                        <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.push(`/scheduled-messages/${m.id}?edit=true`)}><Pencil className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent><p>Edit</p></TooltipContent></Tooltip>
                        {m.status === "Scheduled" && (
                          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handlePause(m.id)}><Pause className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent><p>Pause</p></TooltipContent></Tooltip>
                        )}
                        {m.status === "Paused" && (
                          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleResume(m.id)}><Play className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent><p>Resume</p></TooltipContent></Tooltip>
                        )}
                        <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(m)}><Trash2 className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent><p>Delete</p></TooltipContent></Tooltip>
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

        {/* Delete Dialog */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
          <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete schedule</AlertDialogTitle><AlertDialogDescription>This will permanently delete &quot;{deleteTarget?.title}&quot; and cancel any pending sends. This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{isDeleting ? "Deleting..." : "Delete"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
