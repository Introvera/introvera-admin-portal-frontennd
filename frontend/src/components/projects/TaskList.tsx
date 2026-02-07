"use client";

import { useState, useEffect, useCallback } from "react";
import { projectTaskService } from "@/services/projectTaskService";
import type { ProjectTask, CreateProjectTask, UpdateProjectTask } from "@/types/project";
import { TASK_STATUSES, PROJECT_PRIORITIES, TASK_STATUS_VARIANT, PRIORITY_VARIANT } from "@/types/project";
import { toast } from "sonner";
import { Plus, Trash2, ChevronRight, Loader2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface TaskListProps { projectId: string; }

export function TaskList({ projectId }: TaskListProps) {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [addingSubFor, setAddingSubFor] = useState<string | null>(null);
  const [subTitle, setSubTitle] = useState("");
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<ProjectTask | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTasks = useCallback(async () => {
    try { setIsLoading(true); setTasks(await projectTaskService.getByProject(projectId)); }
    catch { toast.error("Failed to load tasks"); }
    finally { setIsLoading(false); }
  }, [projectId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const toggleExpand = (id: string) => {
    setExpandedTasks((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const addTask = async () => {
    if (!newTitle.trim()) return;
    try {
      await projectTaskService.create(projectId, { title: newTitle.trim(), status: "Todo", priority: "Medium", sortOrder: tasks.length });
      setNewTitle("");
      toast.success("Task added");
      await fetchTasks();
    } catch { toast.error("Failed to add task"); }
  };

  const addSubTask = async (parentId: string) => {
    if (!subTitle.trim()) return;
    try {
      await projectTaskService.create(projectId, { parentTaskId: parentId, title: subTitle.trim(), status: "Todo", priority: "Medium", sortOrder: 0 });
      setSubTitle("");
      setAddingSubFor(null);
      setExpandedTasks((prev) => new Set(prev).add(parentId));
      toast.success("Subtask added");
      await fetchTasks();
    } catch { toast.error("Failed to add subtask"); }
  };

  const updateField = async (task: ProjectTask, field: Partial<UpdateProjectTask>) => {
    try {
      const data: UpdateProjectTask = {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee,
        dueDate: task.dueDate || undefined,
        parentTaskId: task.parentTaskId || undefined,
        sortOrder: task.sortOrder,
        ...field,
      };
      await projectTaskService.update(task.id, data);
      await fetchTasks();
    } catch { toast.error("Failed to update"); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { setIsDeleting(true); await projectTaskService.delete(deleteTarget.id); toast.success("Task deleted"); setDeleteTarget(null); await fetchTasks(); }
    catch { toast.error("Failed to delete"); }
    finally { setIsDeleting(false); }
  };

  const doneCount = tasks.reduce((sum, t) => sum + (t.status === "Done" ? 1 : 0) + t.subTasks.filter((s) => s.status === "Done").length, 0);
  const totalCount = tasks.reduce((sum, t) => sum + 1 + t.subTasks.length, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Tasks</CardTitle>
          <Badge variant="outline" className="text-xs font-normal">{doneCount}/{totalCount} done</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Add task */}
        <div className="flex gap-2">
          <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Add a task..." className="text-sm"
            onKeyDown={(e) => { if (e.key === "Enter") addTask(); }} />
          <Button size="sm" onClick={addTask} disabled={!newTitle.trim()} className="gap-1 shrink-0"><Plus className="h-3.5 w-3.5" /> Add</Button>
        </div>

        {isLoading && <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}

        {!isLoading && tasks.length === 0 && <p className="py-3 text-center text-xs text-muted-foreground">No tasks yet. Add one above.</p>}

        {!isLoading && tasks.length > 0 && (
          <div className="space-y-1">
            {tasks.map((task) => {
              const isExpanded = expandedTasks.has(task.id);
              const hasSubs = task.subTasks.length > 0;
              return (
                <div key={task.id}>
                  {/* Parent task */}
                  <div className="group flex items-center gap-2 rounded-lg border p-2.5 hover:bg-muted/50 transition-colors">
                    {/* Expand toggle */}
                    <button onClick={() => hasSubs && toggleExpand(task.id)} className={cn("shrink-0 p-0.5", hasSubs ? "cursor-pointer" : "invisible")}>
                      <ChevronRight className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", isExpanded && "rotate-90")} />
                    </button>

                    {/* Title */}
                    <span className={cn("flex-1 text-sm font-medium truncate", task.status === "Done" && "line-through text-muted-foreground")}>{task.title}</span>

                    {/* Priority */}
                    <Select value={task.priority} onValueChange={(v) => updateField(task, { priority: v as ProjectTask["priority"] })}>
                      <SelectTrigger className="h-6 w-[80px] text-[11px] border-0 bg-transparent p-0 pl-1"><Badge variant={PRIORITY_VARIANT[task.priority]} className="text-[10px] px-1.5 py-0">{task.priority}</Badge></SelectTrigger>
                      <SelectContent>{PROJECT_PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>

                    {/* Status */}
                    <Select value={task.status} onValueChange={(v) => updateField(task, { status: v as ProjectTask["status"] })}>
                      <SelectTrigger className="h-6 w-[100px] text-[11px] border-0 bg-transparent p-0 pl-1"><Badge variant={TASK_STATUS_VARIANT[task.status]} className="text-[10px] px-1.5 py-0">{TASK_STATUSES.find((s) => s.value === task.status)?.label}</Badge></SelectTrigger>
                      <SelectContent>{TASK_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                    </Select>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setAddingSubFor(addingSubFor === task.id ? null : task.id); setSubTitle(""); }}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(task)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Add subtask inline */}
                  {addingSubFor === task.id && (
                    <div className="ml-8 mt-1 flex gap-2">
                      <Input value={subTitle} onChange={(e) => setSubTitle(e.target.value)} placeholder="Subtask title..." className="text-xs h-8"
                        onKeyDown={(e) => { if (e.key === "Enter") addSubTask(task.id); if (e.key === "Escape") setAddingSubFor(null); }}
                        autoFocus />
                      <Button size="sm" className="h-8 text-xs" onClick={() => addSubTask(task.id)} disabled={!subTitle.trim()}>Add</Button>
                      <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setAddingSubFor(null)}>Cancel</Button>
                    </div>
                  )}

                  {/* Subtasks */}
                  {isExpanded && task.subTasks.length > 0 && (
                    <div className="ml-6 mt-1 space-y-1 border-l-2 border-muted pl-2">
                      {task.subTasks.map((sub) => (
                        <div key={sub.id} className="group flex items-center gap-2 rounded-lg p-2 hover:bg-muted/30 transition-colors">
                          <span className={cn("flex-1 text-xs font-medium truncate", sub.status === "Done" && "line-through text-muted-foreground")}>{sub.title}</span>
                          <Select value={sub.priority} onValueChange={(v) => updateField(sub, { priority: v as ProjectTask["priority"] })}>
                            <SelectTrigger className="h-5 w-[70px] text-[10px] border-0 bg-transparent p-0 pl-1"><Badge variant={PRIORITY_VARIANT[sub.priority]} className="text-[9px] px-1 py-0">{sub.priority}</Badge></SelectTrigger>
                            <SelectContent>{PROJECT_PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                          </Select>
                          <Select value={sub.status} onValueChange={(v) => updateField(sub, { status: v as ProjectTask["status"] })}>
                            <SelectTrigger className="h-5 w-[85px] text-[10px] border-0 bg-transparent p-0 pl-1"><Badge variant={TASK_STATUS_VARIANT[sub.status]} className="text-[9px] px-1 py-0">{TASK_STATUSES.find((s) => s.value === sub.status)?.label}</Badge></SelectTrigger>
                            <SelectContent>{TASK_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                          </Select>
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100" onClick={() => setDeleteTarget(sub)}>
                            <Trash2 className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete task</AlertDialogTitle><AlertDialogDescription>Delete &quot;{deleteTarget?.title}&quot;{deleteTarget?.subTasks?.length ? " and its subtasks" : ""}? This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{isDeleting ? "Deleting..." : "Delete"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
