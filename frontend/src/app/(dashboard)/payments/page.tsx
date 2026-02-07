"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { paymentService } from "@/services/paymentService";
import type { PaymentTransaction, PaginatedResult, PaymentQueryParams } from "@/types/payment";
import { STATUS_VARIANT, PAYMENT_METHODS, PAYMENT_STATUSES } from "@/types/payment";
import { PaginationControl } from "@/components/ui/pagination-control";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, CreditCard, AlertTriangle,
  Search, X, SlidersHorizontal, CalendarDays, Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

const EMPTY: PaginatedResult<PaymentTransaction> = {
  items: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 0,
  hasPreviousPage: false, hasNextPage: false,
};

export default function PaymentsListPage() {
  const router = useRouter();
  const [result, setResult] = useState<PaginatedResult<PaymentTransaction>>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [deleteTarget, setDeleteTarget] = useState<PaymentTransaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  useEffect(() => { setPage(1); }, [statusFilter, methodFilter, dateFrom, dateTo]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true); setError(null);
      const q: PaymentQueryParams = {
        page, pageSize,
        search: debouncedSearch || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        paymentMethod: methodFilter !== "all" ? methodFilter : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      };
      setResult(await paymentService.getPaged(q));
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to load"); }
    finally { setIsLoading(false); }
  }, [page, pageSize, debouncedSearch, statusFilter, methodFilter, dateFrom, dateTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await paymentService.delete(deleteTarget.id);
      toast.success("Transaction deleted");
      setDeleteTarget(null);
      await fetchData();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setIsDeleting(false); }
  };

  const clearFilters = () => { setSearch(""); setStatusFilter("all"); setMethodFilter("all"); setDateFrom(""); setDateTo(""); };
  const hasFilters = debouncedSearch || statusFilter !== "all" || methodFilter !== "all" || dateFrom || dateTo;

  const fmt = (n: number, c: string) => new Intl.NumberFormat("en-US", { style: "currency", currency: c || "USD" }).format(n);
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const methodLabel = (m: string) => PAYMENT_METHODS.find((x) => x.value === m)?.label || m;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Payment Transactions</h2>
            <p className="mt-1 text-sm text-muted-foreground">Track and manage all payment records</p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/payments/new"><Plus className="h-4 w-4" /> Add Payment</Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by reference, payer, email, description..." className="pl-9" />
                  {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>}
                </div>
                <Button variant={showFilters ? "secondary" : "outline"} size="sm" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                  {hasFilters && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">!</span>}
                </Button>
              </div>
              {showFilters && (
                <>
                  <Separator />
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Status</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
                        <SelectContent><SelectItem value="all">All statuses</SelectItem>{PAYMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Payment Method</label>
                      <Select value={methodFilter} onValueChange={setMethodFilter}>
                        <SelectTrigger><SelectValue placeholder="All methods" /></SelectTrigger>
                        <SelectContent><SelectItem value="all">All methods</SelectItem>{PAYMENT_METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">From Date</label>
                      <div className="relative"><CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="pl-9" /></div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">To Date</label>
                      <div className="relative"><CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="pl-9" /></div>
                    </div>
                  </div>
                  {hasFilters && <div className="flex justify-end"><Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={clearFilters}><X className="h-3.5 w-3.5" /> Clear all filters</Button></div>}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex items-center gap-3 py-3">
              <AlertTriangle className="h-4 w-4 text-destructive" /><span className="text-sm text-destructive">{error}</span>
              <Button variant="link" size="sm" className="ml-auto text-destructive" onClick={fetchData}>Retry</Button>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {isLoading && <Card><CardContent className="space-y-4 p-6">{[...Array(5)].map((_, i) => <div key={i} className="flex items-center gap-4"><Skeleton className="h-4 w-28" /><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-24" /><Skeleton className="h-6 w-16 rounded-full" /><Skeleton className="h-4 w-24" /></div>)}</CardContent></Card>}

        {/* Empty */}
        {!isLoading && !error && result.totalCount === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center py-14">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><CreditCard className="h-6 w-6 text-primary" /></div>
              <h3 className="text-[15px] font-semibold">{hasFilters ? "No matching transactions" : "No transactions yet"}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{hasFilters ? "Try adjusting your search or filters." : "Get started by adding your first payment record."}</p>
              {hasFilters
                ? <Button variant="outline" className="mt-5 gap-2" onClick={clearFilters}><X className="h-4 w-4" /> Clear filters</Button>
                : <Button asChild className="mt-5 gap-2"><Link href="/payments/new"><Plus className="h-4 w-4" /> Add Payment</Link></Button>}
            </CardContent>
          </Card>
        )}

        {/* Table */}
        {!isLoading && result.items.length > 0 && (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Reference</TableHead>
                  <TableHead>Payer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((tx) => (
                  <TableRow key={tx.id} className="group cursor-pointer" onClick={() => router.push(`/payments/${tx.id}`)}>
                    <TableCell className="font-mono text-xs font-medium">{tx.transactionReference}</TableCell>
                    <TableCell>
                      <p className="font-medium">{tx.payerName}</p>
                      {tx.payerEmail && <p className="text-xs text-muted-foreground">{tx.payerEmail}</p>}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{fmt(tx.amount, tx.currency)}</TableCell>
                    <TableCell className="text-muted-foreground">{methodLabel(tx.paymentMethod)}</TableCell>
                    <TableCell><Badge variant={STATUS_VARIANT[tx.status]}>{tx.status}</Badge></TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">{fmtDate(tx.transactionDate)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                        <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.push(`/payments/${tx.id}`)}><Eye className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent><p>View</p></TooltipContent></Tooltip>
                        <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.push(`/payments/${tx.id}/edit`)}><Pencil className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent><p>Edit</p></TooltipContent></Tooltip>
                        <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(tx)}><Trash2 className="h-3.5 w-3.5" /></Button></TooltipTrigger><TooltipContent><p>Delete</p></TooltipContent></Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Separator />
            <div className="px-4 py-3">
              <PaginationControl page={result.page} pageSize={result.pageSize} totalCount={result.totalCount} totalPages={result.totalPages} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
            </div>
          </Card>
        )}

        {/* Delete */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Delete transaction</AlertDialogTitle><AlertDialogDescription>This will permanently delete &quot;{deleteTarget?.transactionReference}&quot;. This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{isDeleting ? "Deleting..." : "Delete"}</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
