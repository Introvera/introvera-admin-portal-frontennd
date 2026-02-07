import { apiClient } from "@/lib/api/client";
import type { ProjectTask, CreateProjectTask, UpdateProjectTask } from "@/types/project";

const EP = "/ProjectTasks";

export const projectTaskService = {
  getByProject: (projectId: string) => apiClient.get<ProjectTask[]>(`${EP}/project/${projectId}`),
  getById: (id: string) => apiClient.get<ProjectTask>(`${EP}/${id}`),
  create: (projectId: string, data: CreateProjectTask) => apiClient.post<ProjectTask>(`${EP}/project/${projectId}`, data),
  update: (id: string, data: UpdateProjectTask) => apiClient.put<ProjectTask>(`${EP}/${id}`, data),
  delete: (id: string) => apiClient.delete(`${EP}/${id}`),
};
