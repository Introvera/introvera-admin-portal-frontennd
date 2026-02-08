"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { PasswordInput } from "@/components/ui/password-input";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Verify the reset code on mount
  useEffect(() => {
    if (!oobCode) {
      setError("Invalid or missing reset link. Please request a new one.");
      setVerifying(false);
      return;
    }

    verifyPasswordResetCode(auth, oobCode)
      .then((userEmail) => {
        setEmail(userEmail);
        setVerifying(false);
      })
      .catch(() => {
        setError("This reset link has expired or is invalid. Please request a new one.");
        setVerifying(false);
      });
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      toast.error("Please enter a new password.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPwd) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!oobCode) return;

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/weak-password") {
        toast.error("Password must be at least 6 characters.");
      } else if (code === "auth/expired-action-code") {
        toast.error("This reset link has expired. Please request a new one.");
      } else {
        toast.error("Failed to reset password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center space-y-4">
        <Logo variant="full" height={32} />
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight">
            {success ? "Password reset" : error ? "Link expired" : "Set new password"}
          </h1>
          {!success && !error && (
            <p className="text-sm text-muted-foreground mt-1">
              Enter a new password for <span className="font-medium text-foreground">{email}</span>
            </p>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {success ? (
            <div className="flex flex-col items-center space-y-4 py-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              </div>
              <p className="text-[13px] text-muted-foreground text-center">
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <Button asChild className="w-full h-10 font-medium mt-2">
                <Link href="/login">Go to Sign in</Link>
              </Button>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center space-y-4 py-2">
              <p className="text-[13px] text-muted-foreground text-center">{error}</p>
              <Button asChild variant="outline" className="w-full h-10 font-medium mt-2">
                <Link href="/forgot-password">Request new reset link</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[13px]">New password</Label>
                <PasswordInput
                  id="password"
                  placeholder="At least 6 characters"
                  className="h-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPwd" className="text-[13px]">Confirm new password</Label>
                <PasswordInput
                  id="confirmPwd"
                  placeholder="Repeat your password"
                  className="h-10"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                  required
                />
              </div>

              <Button type="submit" className="w-full h-10 font-medium" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset password"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
