import { apiClient } from "@/lib/api/client";
import type {
  ScheduledMessage,
  CreateScheduledMessage,
  UpdateScheduledMessage,
  ScheduledMessageQueryParams,
  MessageLog,
  MessageLogQueryParams,
  PaginatedResult,
} from "@/types/scheduledMessage";

const EP = "/scheduled-messages";

export const scheduledMessageService = {
  getPaged: (q: ScheduledMessageQueryParams = {}) => {
    const p: Record<string, string> = {};
    if (q.page) p.Page = String(q.page);
    if (q.pageSize) p.PageSize = String(q.pageSize);
    if (q.search) p.Search = q.search;
    if (q.status) p.Status = q.status;
    if (q.scheduleKind) p.ScheduleKind = q.scheduleKind;
    if (q.templateId) p.TemplateId = q.templateId;
    if (q.sortBy) p.SortBy = q.sortBy;
    if (q.sortDirection) p.SortDirection = q.sortDirection;
    return apiClient.get<PaginatedResult<ScheduledMessage>>(EP, { params: p });
  },

  getById: (id: string) =>
    apiClient.get<ScheduledMessage>(`${EP}/${id}`),

  create: (data: CreateScheduledMessage) =>
    apiClient.post<ScheduledMessage>(EP, data),

  update: (id: string, data: UpdateScheduledMessage) =>
    apiClient.put<ScheduledMessage>(`${EP}/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`${EP}/${id}`),

  pause: (id: string) =>
    apiClient.post<ScheduledMessage>(`${EP}/${id}/pause`),

  resume: (id: string) =>
    apiClient.post<ScheduledMessage>(`${EP}/${id}/resume`),

  getLogs: (id: string, q: MessageLogQueryParams = {}) => {
    const p: Record<string, string> = {};
    if (q.page) p.Page = String(q.page);
    if (q.pageSize) p.PageSize = String(q.pageSize);
    if (q.status) p.Status = q.status;
    return apiClient.get<PaginatedResult<MessageLog>>(`${EP}/${id}/logs`, { params: p });
  },
};
