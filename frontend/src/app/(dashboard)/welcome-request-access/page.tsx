"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, HandHeart, CheckCircle2, LogOut as LogOutIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/components/providers/AuthProvider";
import { authService } from "@/services/authService";
import { signOut } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function WelcomeRequestAccessPage() {
  const { appUser } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleRequest = async () => {
    setLoading(true);
    try {
      await authService.requestAccess(message || undefined);
      setSent(true);
      toast.success("Access request submitted!");
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || "Failed to submit request.";
      if (msg.includes("pending")) {
        toast.info("You already have a pending access request.");
        setSent(true);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo variant="full" height={28} />
        </div>

        <Card>
          <CardContent className="flex flex-col items-center p-8">
            {sent ? (
              <>
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
                  <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                </div>
                <h2 className="text-lg font-semibold tracking-tight">Request Submitted</h2>
                <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
                  Your access request has been sent to the administrators. You&apos;ll be notified once it&apos;s reviewed.
                </p>
              </>
            ) : (
              <>
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/8">
                  <HandHeart className="h-7 w-7 text-primary/70" />
                </div>
                <h2 className="text-lg font-semibold tracking-tight">Welcome!</h2>
                <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
                  Your account has been created as{" "}
                  <span className="font-medium text-foreground">{appUser?.email}</span>.
                  You currently have a <span className="font-medium text-foreground">Viewer</span> role
                  with limited access.
                </p>
                <p className="mt-3 max-w-sm text-center text-sm text-muted-foreground">
                  Request elevated access from an administrator to unlock more features.
                </p>

                {/* Message */}
                <div className="mt-5 w-full">
                  <textarea
                    placeholder="Optional message for the admin (e.g. what access you need)..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <Button
                  className="mt-4 w-full h-10 font-medium"
                  onClick={handleRequest}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Request Access"
                  )}
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="mt-4 text-muted-foreground"
              onClick={handleSignOut}
            >
              <LogOutIcon className="mr-2 h-3.5 w-3.5" />
              Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
