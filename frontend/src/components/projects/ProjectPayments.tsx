"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { paymentService } from "@/services/paymentService";
import type { PaymentTransaction } from "@/types/payment";
import { STATUS_VARIANT, PAYMENT_METHODS } from "@/types/payment";
import { Loader2, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props { projectId: string; projectName: string; }

export function ProjectPayments({ projectId, projectName }: Props) {
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    try { setIsLoading(true); const res = await paymentService.getPaged({ pageSize: 100 }); setPayments(res.items.filter((p) => p.projectId === projectId)); }
    catch { /* ignore */ }
    finally { setIsLoading(false); }
  }, [projectId]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const fmt = (n: number, c: string) => new Intl.NumberFormat("en-US", { style: "currency", currency: c || "USD" }).format(n);
  const total = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Payments</CardTitle>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" asChild>
            <Link href={`/payments/new?projectId=${projectId}`}><Plus className="h-3 w-3" /> Add Payment</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}

        {!isLoading && payments.length === 0 && (
          <p className="py-3 text-center text-xs text-muted-foreground">No payments linked to this project.</p>
        )}

        {!isLoading && payments.length > 0 && (
          <>
            <div className="space-y-2">
              {payments.map((p) => (
                <Link key={p.id} href={`/payments/${p.id}`} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.transactionReference}</p>
                    <p className="text-xs text-muted-foreground">{p.payerName}</p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{fmt(p.amount, p.currency)}</span>
                  <Badge variant={STATUS_VARIANT[p.status]} className="text-[10px]">{p.status}</Badge>
                  <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                </Link>
              ))}
            </div>
            <div className="flex justify-between items-center pt-2 border-t text-xs text-muted-foreground">
              <span>{payments.length} payment{payments.length !== 1 ? "s" : ""}</span>
              <span className="font-medium text-foreground">Total: {fmt(total, "USD")}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
