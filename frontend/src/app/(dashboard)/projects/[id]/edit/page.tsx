"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { projectService } from "@/services/projectService";
import type { Project, CreateProject } from "@/types/project";
import { ProjectForm } from "@/components/forms/ProjectForm";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetch_ = useCallback(async () => {
    try { setIsLoading(true); setProject(await projectService.getById(id)); }
    catch { toast.error("Project not found"); router.push("/projects"); }
    finally { setIsLoading(false); }
  }, [id, router]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleSubmit = async (data: CreateProject) => {
    try { setIsSubmitting(true); await projectService.update(id, data); toast.success("Project updated"); router.push(`/projects/${id}`); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setIsSubmitting(false); }
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!project) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild><Link href={`/projects/${id}`}><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Edit Project</h2>
          <p className="text-sm text-muted-foreground">{project.name}</p>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Project Details</CardTitle><CardDescription>Update your project information</CardDescription></CardHeader>
        <CardContent><ProjectForm initialData={project} onSubmit={handleSubmit} onCancel={() => router.push(`/projects/${id}`)} isLoading={isSubmitting} /></CardContent>
      </Card>
    </div>
  );
}
