"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { projectService } from "@/services/projectService";
import type { Project } from "@/types/project";
import { PROJECT_STATUS_VARIANT, PRIORITY_VARIANT } from "@/types/project";
import { TaskList } from "@/components/projects/TaskList";
import { ProjectPayments } from "@/components/projects/ProjectPayments";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Loader2, CalendarDays, DollarSign, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <dt className="w-28 shrink-0 text-xs font-medium text-muted-foreground uppercase tracking-wider pt-0.5">{label}</dt>
      <dd className="text-sm">{children || <span className="text-muted-foreground">--</span>}</dd>
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetch_ = useCallback(async () => {
    try { setIsLoading(true); setProject(await projectService.getById(id)); }
    catch { toast.error("Project not found"); router.push("/projects"); }
    finally { setIsLoading(false); }
  }, [id, router]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleDelete = async () => {
    try { setIsDeleting(true); await projectService.delete(id); toast.success("Project deleted"); router.push("/projects"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setIsDeleting(false); }
  };

  const fmt = (n?: number) => n != null ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n) : null;
  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : null;

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!project) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild><Link href="/projects"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold tracking-tight">{project.name}</h2>
              <Badge variant={PROJECT_STATUS_VARIANT[project.status]}>{project.status}</Badge>
              <Badge variant={PRIORITY_VARIANT[project.priority]}>{project.priority}</Badge>
            </div>
            {project.category && <p className="text-sm text-muted-foreground">{project.category}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" asChild><Link href={`/projects/${id}/edit`}><Pencil className="h-3.5 w-3.5" /> Edit</Link></Button>
          <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive" onClick={() => setShowDelete(true)}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Tasks", value: `${project.completedTaskCount}/${project.taskCount}`, sub: "completed" },
          { label: "Budget", value: fmt(project.budget) || "--" },
          { label: "Payments", value: fmt(project.totalPayments) },
          { label: "Deadline", value: fmtDate(project.deadline) || "--" },
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{s.value}{s.sub && <span className="ml-1 text-xs font-normal text-muted-foreground">{s.sub}</span>}</p>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: Info + Tasks */}
        <div className="lg:col-span-3 space-y-6">
          {/* Project info */}
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Details</CardTitle></CardHeader>
            <CardContent>
              <dl className="divide-y">
                {project.description && <DetailRow label="Description">{project.description}</DetailRow>}
                {project.clientName && <DetailRow label="Client"><div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-muted-foreground" />{project.clientName}</div></DetailRow>}
                {project.clientEmail && <DetailRow label="Email"><div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{project.clientEmail}</div></DetailRow>}
                <DetailRow label="Created">{fmtDate(project.createdAt)}</DetailRow>
                {project.lastModifiedAt && <DetailRow label="Modified">{fmtDate(project.lastModifiedAt)}</DetailRow>}
              </dl>
            </CardContent>
          </Card>

          {/* Tasks */}
          <TaskList projectId={id} />
        </div>

        {/* Right: Payments */}
        <div className="lg:col-span-2">
          <ProjectPayments projectId={id} projectName={project.name} />
        </div>
      </div>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete project</AlertDialogTitle><AlertDialogDescription>This will permanently delete &quot;{project.name}&quot; and all its tasks. Linked payments will be unlinked.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{isDeleting ? "Deleting..." : "Delete"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
