import { apiClient } from "@/lib/api/client";
import type {
  WhatsAppTemplate,
  CreateWhatsAppTemplate,
  UpdateWhatsAppTemplate,
  WhatsAppTemplateQueryParams,
  PaginatedResult,
} from "@/types/whatsappTemplate";

const EP = "/whatsapp-templates";

export const whatsappTemplateService = {
  getPaged: (q: WhatsAppTemplateQueryParams = {}) => {
    const p: Record<string, string> = {};
    if (q.page) p.Page = String(q.page);
    if (q.pageSize) p.PageSize = String(q.pageSize);
    if (q.search) p.Search = q.search;
    if (q.category) p.Category = q.category;
    if (q.isActive !== undefined) p.IsActive = String(q.isActive);
    return apiClient.get<PaginatedResult<WhatsAppTemplate>>(EP, { params: p });
  },

  getById: (id: string) =>
    apiClient.get<WhatsAppTemplate>(`${EP}/${id}`),

  create: (data: CreateWhatsAppTemplate) =>
    apiClient.post<WhatsAppTemplate>(EP, data),

  update: (id: string, data: UpdateWhatsAppTemplate) =>
    apiClient.put<WhatsAppTemplate>(`${EP}/${id}`, data),

  activate: (id: string) =>
    apiClient.post<WhatsAppTemplate>(`${EP}/${id}/activate`),

  deactivate: (id: string) =>
    apiClient.post<WhatsAppTemplate>(`${EP}/${id}/deactivate`),
};
