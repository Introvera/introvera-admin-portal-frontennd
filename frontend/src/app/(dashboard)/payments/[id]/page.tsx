"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { paymentService } from "@/services/paymentService";
import type { PaymentTransaction } from "@/types/payment";
import { STATUS_VARIANT, PAYMENT_METHODS } from "@/types/payment";
import { AttachmentPanel } from "@/components/attachments/AttachmentPanel";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm font-medium">{children || <span className="text-muted-foreground">—</span>}</dd>
    </div>
  );
}

export default function PaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [tx, setTx] = useState<PaymentTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTx = useCallback(async () => {
    try {
      setIsLoading(true);
      setTx(await paymentService.getById(id));
    } catch {
      toast.error("Transaction not found");
      router.push("/payments");
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => { fetchTx(); }, [fetchTx]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await paymentService.delete(id);
      toast.success("Transaction deleted");
      router.push("/payments");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  const fmt = (n: number, c: string) => new Intl.NumberFormat("en-US", { style: "currency", currency: c || "USD" }).format(n);
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const methodLabel = (m: string) => PAYMENT_METHODS.find((x) => x.value === m)?.label || m;

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!tx) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href="/payments"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold tracking-tight">{tx.transactionReference}</h2>
              <Badge variant={STATUS_VARIANT[tx.status]}>{tx.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{tx.payerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link href={`/payments/${id}/edit`}><Pencil className="h-3.5 w-3.5" /> Edit</Link>
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive" onClick={() => setShowDelete(true)}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Details */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader><CardTitle className="text-base">Transaction Details</CardTitle></CardHeader>
            <CardContent>
              <dl className="divide-y">
                <DetailRow label="Reference">{tx.transactionReference}</DetailRow>
                <DetailRow label="Amount"><span className="text-base font-bold tabular-nums">{fmt(tx.amount, tx.currency)}</span></DetailRow>
                <DetailRow label="Status"><Badge variant={STATUS_VARIANT[tx.status]}>{tx.status}</Badge></DetailRow>
                <DetailRow label="Payment Method">{methodLabel(tx.paymentMethod)}</DetailRow>
                <DetailRow label="Transaction Date">{fmtDate(tx.transactionDate)}</DetailRow>
                <DetailRow label="Payer Name">{tx.payerName}</DetailRow>
                <DetailRow label="Payer Email">{tx.payerEmail}</DetailRow>
                <DetailRow label="Description">{tx.description}</DetailRow>
                <DetailRow label="Notes">{tx.notes}</DetailRow>
                <DetailRow label="Project">
                  {tx.projectId ? <Link href={`/projects/${tx.projectId}`} className="text-primary hover:underline">{tx.projectName || "View Project"}</Link> : null}
                </DetailRow>
                <DetailRow label="Created">{fmtDate(tx.createdAt)}</DetailRow>
                {tx.lastModifiedAt && <DetailRow label="Last Modified">{fmtDate(tx.lastModifiedAt)}</DetailRow>}
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Attachments */}
        <div className="lg:col-span-2">
          <AttachmentPanel transactionId={tx.id} transactionRef={tx.transactionReference} readonly />
        </div>
      </div>

      {/* Delete confirm */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete transaction</AlertDialogTitle><AlertDialogDescription>This will permanently delete &quot;{tx.transactionReference}&quot; and all its attachments. This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{isDeleting ? "Deleting..." : "Delete"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
