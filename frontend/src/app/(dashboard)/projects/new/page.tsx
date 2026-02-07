"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { projectService } from "@/services/projectService";
import type { CreateProject } from "@/types/project";
import { ProjectForm } from "@/components/forms/ProjectForm";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function NewProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateProject) => {
    try {
      setIsSubmitting(true);
      const created = await projectService.create(data);
      toast.success("Project created");
      router.push(`/projects/${created.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild><Link href="/projects"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">New Project</h2>
          <p className="text-sm text-muted-foreground">Create a new project to track tasks and payments</p>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Project Details</CardTitle><CardDescription>Fill in your project information</CardDescription></CardHeader>
        <CardContent><ProjectForm onSubmit={handleSubmit} onCancel={() => router.push("/projects")} isLoading={isSubmitting} /></CardContent>
      </Card>
    </div>
  );
}
