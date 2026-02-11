import type { PaginatedResult } from "@/types/project";

export type TemplateCategory = "Utility" | "Authentication" | "Marketing";

export const TEMPLATE_CATEGORIES: TemplateCategory[] = ["Utility", "Authentication", "Marketing"];

export const CATEGORY_VARIANT: Record<TemplateCategory, "default" | "secondary" | "destructive" | "outline"> = {
  Utility: "default",
  Authentication: "secondary",
  Marketing: "outline",
};

export interface WhatsAppTemplate {
  id: string;
  templateName: string;
  category: TemplateCategory;
  languageCode: string;
  description?: string;
  bodyParamCount: number;
  exampleVarsJson?: string;
  isActive: boolean;
  createdAt: string;
  updatedAtUtc: string;
}

export interface CreateWhatsAppTemplate {
  templateName: string;
  category: TemplateCategory;
  languageCode: string;
  description?: string;
  bodyParamCount: number;
  exampleVarsJson?: string;
  isActive: boolean;
}

export interface UpdateWhatsAppTemplate {
  templateName: string;
  category: TemplateCategory;
  languageCode: string;
  description?: string;
  bodyParamCount: number;
  exampleVarsJson?: string;
}

export interface WhatsAppTemplateQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
}

export type { PaginatedResult };
