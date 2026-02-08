"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { paymentService } from "@/services/paymentService";
import type { PaymentTransaction } from "@/types/payment";
import { STATUS_VARIANT, PAYMENT_METHODS } from "@/types/payment";
import { AttachmentPanel } from "@/components/attachments/AttachmentPanel";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Loader2, Receipt, User, CreditCard, FileText, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-2.5">
      <dt className="w-32 shrink-0 text-[12.5px] font-medium text-muted-foreground">{label}</dt>
      <dd className="text-[13px] font-medium min-w-0">{children || <span className="text-muted-foreground/60">--</span>}</dd>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <h3 className="text-[13.5px] font-semibold">{title}</h3>
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
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href="/payments"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-semibold tracking-tight">{tx.transactionReference}</h2>
              <Badge variant={STATUS_VARIANT[tx.status]}>{tx.status}</Badge>
            </div>
            <p className="text-[12.5px] text-muted-foreground mt-0.5">{tx.payerName}</p>
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

      {/* Amount highlight */}
      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-[12px] font-medium text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold tracking-tight tabular-nums mt-0.5">{fmt(tx.amount, tx.currency)}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Details */}
        <div className="lg:col-span-3 space-y-5">
          {/* Transaction Details */}
          <Card>
            <CardContent className="p-5">
              <SectionTitle icon={Receipt} title="Transaction Details" />
              <dl className="divide-y divide-border/60">
                <DetailRow label="Reference">{tx.transactionReference}</DetailRow>
                <DetailRow label="Status"><Badge variant={STATUS_VARIANT[tx.status]}>{tx.status}</Badge></DetailRow>
                <DetailRow label="Payment Method">{methodLabel(tx.paymentMethod)}</DetailRow>
                <DetailRow label="Date">{fmtDate(tx.transactionDate)}</DetailRow>
                <DetailRow label="Project">
                  {tx.projectId ? <Link href={`/projects/${tx.projectId}`} className="text-primary hover:underline">{tx.projectName || "View Project"}</Link> : null}
                </DetailRow>
              </dl>
            </CardContent>
          </Card>

          {/* Payer Info */}
          <Card>
            <CardContent className="p-5">
              <SectionTitle icon={User} title="Payer Information" />
              <dl className="divide-y divide-border/60">
                <DetailRow label="Name">{tx.payerName}</DetailRow>
                <DetailRow label="Email">{tx.payerEmail}</DetailRow>
              </dl>
            </CardContent>
          </Card>

          {/* Additional */}
          {(tx.description || tx.notes) && (
            <Card>
              <CardContent className="p-5">
                <SectionTitle icon={FileText} title="Additional Details" />
                <dl className="divide-y divide-border/60">
                  {tx.description && <DetailRow label="Description">{tx.description}</DetailRow>}
                  {tx.notes && <DetailRow label="Notes">{tx.notes}</DetailRow>}
                </dl>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardContent className="p-5">
              <SectionTitle icon={Clock} title="Timestamps" />
              <dl className="divide-y divide-border/60">
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
