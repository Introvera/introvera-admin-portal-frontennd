"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { scheduledMessageService } from "@/services/scheduledMessageService";
import type { MessageLog, MessageLogQueryParams, PaginatedResult } from "@/types/scheduledMessage";
import { LOG_STATUS_VARIANT } from "@/types/scheduledMessage";
import { PaginationControl } from "@/components/ui/pagination-control";
import { ArrowLeft, AlertTriangle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const LOG_STATUSES = ["Queued", "Sent", "Delivered", "Read", "Failed"] as const;

const EMPTY: PaginatedResult<MessageLog> = {
  items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0, hasPreviousPage: false, hasNextPage: false,
};

export default function ScheduledMessageLogsPage() {
  const params = useParams();
  const id = params.id as string;

  const [result, setResult] = useState<PaginatedResult<MessageLog>>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => { setPage(1); }, [statusFilter]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true); setError(null);
      const q: MessageLogQueryParams = {
        page, pageSize,
        status: statusFilter !== "all" ? statusFilter : undefined,
      };
      setResult(await scheduledMessageService.getLogs(id, q));
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to load logs"); }
    finally { setIsLoading(false); }
  }, [id, page, pageSize, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fmtDate = (d?: string) => d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—";
  const maskPhone = (p: string) => p.length > 4 ? `***${p.slice(-4)}` : "****";

  return (
    <TooltipProvider delayDuration={0}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild><Link href={`/scheduled-messages/${id}`}><ArrowLeft className="h-4 w-4" /></Link></Button>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Send Logs</h2>
            <p className="text-sm text-muted-foreground">Delivery history for this scheduled message</p>
          </div>
        </div>

        {/* Filter */}
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="space-y-1.5 w-48">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue placeholder="All" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{LOG_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
        </CardContent></Card>

        {/* Error */}
        {error && <Card className="border-destructive/30 bg-destructive/5"><CardContent className="flex items-center gap-3 py-3"><AlertTriangle className="h-4 w-4 text-destructive" /><span className="text-sm text-destructive">{error}</span><Button variant="link" size="sm" className="ml-auto text-destructive" onClick={fetchData}>Retry</Button></CardContent></Card>}

        {/* Loading */}
        {isLoading && <Card><CardContent className="space-y-4 p-6">{[...Array(5)].map((_, i) => <div key={i} className="flex items-center gap-4"><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-24" /><Skeleton className="h-6 w-16 rounded-full" /><Skeleton className="h-4 w-40" /></div>)}</CardContent></Card>}

        {/* Empty */}
        {!isLoading && !error && result.totalCount === 0 && (
          <Card className="border-dashed"><CardContent className="flex flex-col items-center py-14">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><FileText className="h-6 w-6 text-primary" /></div>
            <h3 className="text-[15px] font-semibold">No logs yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Logs will appear after the scheduled message is processed.</p>
          </CardContent></Card>
        )}

        {/* Table */}
        {!isLoading && result.items.length > 0 && (
          <Card>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attempt</TableHead>
                <TableHead>Message ID</TableHead>
                <TableHead>Error</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {result.items.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-muted-foreground tabular-nums text-xs">{fmtDate(log.createdAtUtc)}</TableCell>
                    <TableCell className="font-mono text-xs">{maskPhone(log.toPhone)}</TableCell>
                    <TableCell className="text-muted-foreground">{log.templateName}</TableCell>
                    <TableCell><Badge variant={LOG_STATUS_VARIANT[log.status]}>{log.status}</Badge></TableCell>
                    <TableCell className="text-center tabular-nums">{log.attemptCount}</TableCell>
                    <TableCell>
                      {log.providerMessageId ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help text-xs font-mono text-muted-foreground truncate max-w-[100px] inline-block">{log.providerMessageId.slice(0, 16)}...</span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm"><p className="break-all font-mono text-xs">{log.providerMessageId}</p></TooltipContent>
                        </Tooltip>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      {log.error ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help text-xs text-destructive truncate max-w-[150px] inline-block">{log.error.slice(0, 40)}...</span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-md"><p className="break-all text-xs">{log.error}</p></TooltipContent>
                        </Tooltip>
                      ) : "—"}
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
