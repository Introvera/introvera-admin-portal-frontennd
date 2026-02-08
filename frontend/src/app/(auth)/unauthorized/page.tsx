"use client";

import Link from "next/link";
import { ShieldX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/ui/Logo";

export default function UnauthorizedPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center space-y-4">
        <Logo variant="full" height={32} />
      </div>

      <Card>
        <CardContent className="flex flex-col items-center p-8">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/8">
            <ShieldX className="h-7 w-7 text-destructive/70" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Access Denied</h1>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
            You don&apos;t have permission to access this page. If you believe this is an error, please contact your administrator.
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/overview" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
