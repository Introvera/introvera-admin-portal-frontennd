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
import { signIn } from "@/lib/firebase";
import { useAuth } from "@/components/providers/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Signed in successfully!");
      router.push("/overview");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/email-not-verified") {
        // Redirect to verify-email page
        router.push("/verify-email");
      } else {
        const message = getFirebaseErrorMessage(err);
        toast.error(message);
      }
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
          <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your admin account</p>
        </div>
      </div>

      {/* Login Card */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[13px]">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@introvera.com"
                className="h-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[13px]">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-[12px] font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                placeholder="Enter your password"
                className="h-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full h-10 font-medium" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Register link */}
      <p className="text-center text-[13px] text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
          Create account
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
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    default:
      return "Sign in failed. Please try again.";
  }
}

