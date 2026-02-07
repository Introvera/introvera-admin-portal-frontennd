export type ProjectStatus = "Planning" | "Active" | "OnHold" | "Completed" | "Cancelled";
export type ProjectPriority = "Low" | "Medium" | "High" | "Critical";
export type TaskStatus = "Todo" | "InProgress" | "Review" | "Done";

export interface Project {
  id: string;
  name: string;
  description?: string;
  clientName?: string;
  clientEmail?: string;
  category?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  budget?: number;
  deadline?: string;
  taskCount: number;
  completedTaskCount: number;
  totalPayments: number;
  createdAt: string;
  lastModifiedAt?: string;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  parentTaskId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: ProjectPriority;
  assignee?: string;
  dueDate?: string;
  sortOrder: number;
  subTasks: ProjectTask[];
  createdAt: string;
  lastModifiedAt?: string;
}

export interface CreateProject {
  name: string;
  description?: string;
  clientName?: string;
  clientEmail?: string;
  category?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  budget?: number;
  deadline?: string;
}

export interface UpdateProject extends CreateProject {}

export interface ProjectQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  priority?: string;
  sortBy?: string;
  sortDirection?: string;
}

export interface CreateProjectTask {
  parentTaskId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: ProjectPriority;
  assignee?: string;
  dueDate?: string;
  sortOrder: number;
}

export interface UpdateProjectTask extends CreateProjectTask {}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export const PROJECT_STATUSES: ProjectStatus[] = ["Planning", "Active", "OnHold", "Completed", "Cancelled"];
export const PROJECT_PRIORITIES: ProjectPriority[] = ["Low", "Medium", "High", "Critical"];
export const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "Todo", label: "To Do" },
  { value: "InProgress", label: "In Progress" },
  { value: "Review", label: "Review" },
  { value: "Done", label: "Done" },
];

export const PROJECT_STATUS_VARIANT: Record<ProjectStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Planning: "outline",
  Active: "default",
  OnHold: "secondary",
  Completed: "default",
  Cancelled: "destructive",
};

export const PRIORITY_VARIANT: Record<ProjectPriority, "default" | "secondary" | "destructive" | "outline"> = {
  Low: "secondary",
  Medium: "outline",
  High: "default",
  Critical: "destructive",
};

export const TASK_STATUS_VARIANT: Record<TaskStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Todo: "outline",
  InProgress: "default",
  Review: "secondary",
  Done: "default",
};
