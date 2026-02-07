"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { projectService } from "@/services/projectService";
import type { Project, PaginatedResult, ProjectQueryParams } from "@/types/project";
import { PROJECT_STATUS_VARIANT, PRIORITY_VARIANT, PROJECT_STATUSES, PROJECT_PRIORITIES } from "@/types/project";
import { PaginationControl } from "@/components/ui/pagination-control";
import { toast } from "sonner";
import { Plus, Trash2, Eye, Pencil, Search, X, SlidersHorizontal, FolderKanban, AlertTriangle, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const EMPTY: PaginatedResult<Project> = { items: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 0, hasPreviousPage: false, hasNextPage: false };

export default function ProjectsListPage() {
  const router = useRouter();
  const [result, setResult] = useState<PaginatedResult<Project>>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);
  useEffect(() => { setPage(1); }, [statusFilter, priorityFilter]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true); setError(null);
      const q: ProjectQueryParams = { page, pageSize, search: debouncedSearch || undefined, status: statusFilter !== "all" ? statusFilter : undefined, priority: priorityFilter !== "all" ? priorityFilter : undefined };
      setResult(await projectService.getPaged(q));
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to load"); }
    finally { setIsLoading(false); }
  }, [page, pageSize, debouncedSearch, statusFilter, priorityFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { setIsDeleting(true); await projectService.delete(deleteTarget.id); toast.success("Project deleted"); setDeleteTarget(null); await fetchData(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setIsDeleting(false); }
  };

  const clearFilters = () => { setSearch(""); setStatusFilter("all"); setPriorityFilter("all"); };
  const hasFilters = debouncedSearch || statusFilter !== "all" || priorityFilter !== "all";
  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  return (
    <TooltipProvider delayDuration={0}>
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Projects</h2>
            <p className="mt-1 text-sm text-muted-foreground">Manage your projects and tasks</p>
          </div>
          <Button asChild className="gap-2"><Link href="/projects/new"><Plus className="h-4 w-4" /> New Project</Link></Button>
        </div>

        <Card><CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..." className="pl-9" />
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
                  <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue placeholder="All" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{PROJECT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Priority</label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}><SelectTrigger><SelectValue placeholder="All" /></SelectTrigger><SelectContent><SelectItem value="all">All priorities</SelectItem>{PROJECT_PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
              {hasFilters && <div className="flex justify-end"><Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={clearFilters}><X className="h-3.5 w-3.5" /> Clear filters</Button></div>}
            </>)}
          </div>
        </CardContent></Card>

        {error && <Card className="border-destructive/30 bg-destructive/5"><CardContent className="flex items-center gap-3 py-3"><AlertTriangle className="h-4 w-4 text-destructive" /><span className="text-sm text-destructive">{error}</span><Button variant="link" size="sm" className="ml-auto text-destructive" onClick={fetchData}>Retry</Button></CardContent></Card>}
        {isLoading && <Card><CardContent className="space-y-4 p-6">{[...Array(4)].map((_, i) => <div key={i} className="flex items-center gap-4"><Skeleton className="h-4 w-40" /><Skeleton className="h-4 w-24" /><Skeleton className="h-6 w-16 rounded-full" /><Skeleton className="h-4 w-20" /></div>)}</CardContent></Card>}

        {!isLoading && !error && result.totalCount === 0 && (
          <Card className="border-dashed"><CardContent className="flex flex-col items-center py-14">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><FolderKanban className="h-6 w-6 text-primary" /></div>
            <h3 className="text-[15px] font-semibold">{hasFilters ? "No matching projects" : "No projects yet"}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{hasFilters ? "Try adjusting your filters." : "Create your first project to get started."}</p>
            {hasFilters ? <Button variant="outline" className="mt-5 gap-2" onClick={clearFilters}><X className="h-4 w-4" /> Clear</Button> : <Button asChild className="mt-5 gap-2"><Link href="/projects/new"><Plus className="h-4 w-4" /> New Project</Link></Button>}
          </CardContent></Card>
        )}

        {!isLoading && result.items.length > 0 && (
          <Card>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow></TableHeader>
              <TableBody>
                {result.items.map((p) => (
                  <TableRow key={p.id} className="group cursor-pointer" onClick={() => router.push(`/projects/${p.id}`)}>
                    <TableCell>
                      <p className="font-medium">{p.name}</p>
                      {p.category && <p className="text-xs text-muted-foreground">{p.category}</p>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.clientName || "—"}</TableCell>
                    <TableCell><Badge variant={PROJECT_STATUS_VARIANT[p.status]}>{p.status}</Badge></TableCell>
                    <TableCell><Badge variant={PRIORITY_VARIANT[p.priority]}>{p.priority}</Badge></TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">{p.completedTaskCount}/{p.taskCount}</TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">{fmtDate(p.deadline)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                        <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.push(`/projects/${p.id}`)}><Eye className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent><p>View</p></TooltipContent></Tooltip>
                        <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.push(`/projects/${p.id}/edit`)}><Pencil className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent><p>Edit</p></TooltipContent></Tooltip>
                        <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(p)}><Trash2 className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent><p>Delete</p></TooltipContent></Tooltip>
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

        <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
          <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete project</AlertDialogTitle><AlertDialogDescription>This will permanently delete &quot;{deleteTarget?.name}&quot; and all its tasks. Linked payments will be unlinked. This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{isDeleting ? "Deleting..." : "Delete"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
