"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";

export default function LoginPage() {
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
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[13px]">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@introvera.com"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[13px]">Password</Label>
                <button type="button" className="text-[12px] font-medium text-primary hover:text-primary/80 transition-colors">
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="h-10"
              />
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="h-3.5 w-3.5 rounded border-input accent-primary"
              />
              <label htmlFor="remember" className="text-[12.5px] text-muted-foreground select-none">
                Remember me for 30 days
              </label>
            </div>

            <Button type="submit" className="w-full h-10 font-medium">
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="text-center text-[11.5px] text-muted-foreground">
        Secured by Introvera. All rights reserved.
      </p>
    </div>
  );
}
