import { apiClient } from "@/lib/api/client";
import type { Project, CreateProject, UpdateProject, ProjectQueryParams, PaginatedResult } from "@/types/project";

const EP = "/Projects";

export const projectService = {
  getPaged: (q: ProjectQueryParams = {}) => {
    const p: Record<string, string> = {};
    if (q.page) p.Page = String(q.page);
    if (q.pageSize) p.PageSize = String(q.pageSize);
    if (q.search) p.Search = q.search;
    if (q.status) p.Status = q.status;
    if (q.priority) p.Priority = q.priority;
    if (q.sortBy) p.SortBy = q.sortBy;
    if (q.sortDirection) p.SortDirection = q.sortDirection;
    return apiClient.get<PaginatedResult<Project>>(EP, { params: p });
  },
  getAll: () => apiClient.get<Project[]>(`${EP}/simple`),
  getById: (id: string) => apiClient.get<Project>(`${EP}/${id}`),
  create: (data: CreateProject) => apiClient.post<Project>(EP, data),
  update: (id: string, data: UpdateProject) => apiClient.put<Project>(`${EP}/${id}`, data),
  delete: (id: string) => apiClient.delete(`${EP}/${id}`),
};
