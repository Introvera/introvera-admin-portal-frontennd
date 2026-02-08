"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, MailCheck, RefreshCw, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { sendEmailVerification, signOut, type ActionCodeSettings } from "firebase/auth";
import { auth, onAuthStateChanged } from "@/lib/firebase";

function getActionCodeSettings(): ActionCodeSettings {
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  return { url: `${origin}/auth/action`, handleCodeInApp: false };
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Listen for auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email);
        if (user.emailVerified) {
          // Already verified — redirect to dashboard
          router.replace("/overview");
          return;
        }
      } else {
        // Not signed in — go to login
        router.replace("/login");
        return;
      }
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setResending(true);
    try {
      await sendEmailVerification(user, getActionCodeSettings());
      toast.success("Verification email sent!");
      setCooldown(60);
    } catch {
      toast.error("Failed to send email. Try again later.");
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerification = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;
    setChecking(true);
    try {
      await user.reload();
      if (user.emailVerified) {
        toast.success("Email verified! Redirecting...");
        // Sign out and let them sign in fresh through the normal login flow
        await signOut(auth);
        router.replace("/login");
      } else {
        toast.info("Email not verified yet. Please check your inbox.");
      }
    } catch {
      toast.error("Could not check verification status.");
    } finally {
      setChecking(false);
    }
  }, [router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  if (loading) {
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
          <h1 className="text-xl font-semibold tracking-tight">Verify your email</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Check your inbox for the verification link
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center p-8">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <MailCheck className="h-7 w-7 text-primary" />
          </div>

          <p className="text-[13px] text-muted-foreground text-center">
            We&apos;ve sent a verification link to{" "}
            <span className="font-medium text-foreground">{email}</span>.
            Click the link in the email to activate your account.
          </p>

          <div className="mt-6 w-full space-y-3">
            {/* Check verification status */}
            <Button
              className="w-full h-10 font-medium"
              onClick={handleCheckVerification}
              disabled={checking}
            >
              {checking ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...</>
              ) : (
                "I've verified my email"
              )}
            </Button>

            {/* Resend */}
            <Button
              variant="outline"
              className="w-full h-10 font-medium"
              onClick={handleResend}
              disabled={resending || cooldown > 0}
            >
              {resending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
              ) : cooldown > 0 ? (
                `Resend in ${cooldown}s`
              ) : (
                <><RefreshCw className="mr-2 h-4 w-4" /> Resend verification email</>
              )}
            </Button>
          </div>

          <p className="mt-5 text-[12px] text-muted-foreground text-center">
            Check your spam folder if you don&apos;t see the email.
          </p>

          <button
            type="button"
            onClick={handleSignOut}
            className="mt-4 text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Use a different account
          </button>
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
