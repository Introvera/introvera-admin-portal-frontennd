"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { paymentService } from "@/services/paymentService";
import type { CreatePaymentTransaction } from "@/types/payment";
import { PaymentTransactionForm } from "@/components/forms/PaymentTransactionForm";
import { AttachmentPanel } from "@/components/attachments/AttachmentPanel";
import { toast } from "sonner";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function NewPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") || undefined;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [createdRef, setCreatedRef] = useState<string>("");

  const handleSubmit = async (data: CreatePaymentTransaction) => {
    try {
      setIsSubmitting(true);
      const created = await paymentService.create(data);
      toast.success("Transaction created — now attach your documents");
      setCreatedId(created.id);
      setCreatedRef(created.transactionReference);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setIsSubmitting(false);
    }
  };

  const backHref = projectId ? `/projects/${projectId}` : "/payments";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href={backHref}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">New Payment Transaction</h2>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">Fill in the details and attach documents</p>
        </div>
      </div>

      {/* Form */}
      {!createdId && (
        <PaymentTransactionForm
          defaultProjectId={projectId}
          onSubmit={handleSubmit}
          onCancel={() => router.push(backHref)}
          isLoading={isSubmitting}
        />
      )}

      {/* Success + Attachments */}
      {createdId && (
        <div className="space-y-5">
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardContent className="flex items-center gap-3 py-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Transaction created successfully</p>
                <p className="text-xs text-muted-foreground">Now attach your documents and images below.</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" asChild>
                  <Link href={backHref}>Back to {projectId ? "project" : "list"}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/payments/${createdId}`}>View transaction</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <AttachmentPanel transactionId={createdId} transactionRef={createdRef} />
        </div>
      )}
    </div>
  );
}

export default function NewPaymentPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
      <NewPaymentContent />
    </Suspense>
  );
}
