"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { PasswordInput } from "@/components/ui/password-input";
import { signUp } from "@/lib/firebase";
import { useAuth } from "@/components/providers/AuthProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, displayName || undefined);
      // Redirect to verify-email page
      router.push("/verify-email");
    } catch (err: unknown) {
      const message = getFirebaseErrorMessage(err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Logo */}
      <div className="flex flex-col items-center space-y-4">
        <Logo variant="full" height={32} />
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground mt-1">Get started with the admin portal</p>
        </div>
      </div>

      {/* Register Card */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-[13px]">Full name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="John Doe"
                className="h-10"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading}
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[13px]">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="h-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[13px]">Password</Label>
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
              <Label htmlFor="confirmPassword" className="text-[13px]">Confirm password</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="Repeat your password"
                className="h-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                required
              />
            </div>

            <Button type="submit" className="w-full h-10 font-medium" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Login link */}
      <p className="text-center text-[13px] text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
          Sign in
        </Link>
      </p>

      {/* Footer */}
      <p className="text-center text-[11.5px] text-muted-foreground">
        Secured by Introvera. All rights reserved.
      </p>
    </div>
  );
}

function getFirebaseErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code;
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/operation-not-allowed":
      return "Email/password sign-up is not enabled.";
    default:
      return "Registration failed. Please try again.";
  }
}
