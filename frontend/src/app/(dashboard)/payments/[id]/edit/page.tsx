"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { paymentService } from "@/services/paymentService";
import type { PaymentTransaction, CreatePaymentTransaction } from "@/types/payment";
import { PaymentTransactionForm } from "@/components/forms/PaymentTransactionForm";
import { AttachmentPanel } from "@/components/attachments/AttachmentPanel";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [tx, setTx] = useState<PaymentTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (data: CreatePaymentTransaction) => {
    try {
      setIsSubmitting(true);
      await paymentService.update(id, data);
      toast.success("Transaction updated");
      router.push(`/payments/${id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!tx) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href={`/payments/${id}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Edit Transaction</h2>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">{tx.transactionReference}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Form */}
        <div className="lg:col-span-3">
          <PaymentTransactionForm
            initialData={tx}
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/payments/${id}`)}
            isLoading={isSubmitting}
          />
        </div>

        {/* Attachments */}
        <div className="lg:col-span-2">
          <AttachmentPanel transactionId={tx.id} transactionRef={tx.transactionReference} />
        </div>
      </div>
    </div>
  );
}
