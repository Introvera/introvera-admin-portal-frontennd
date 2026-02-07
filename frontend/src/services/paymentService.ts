import { apiClient } from "@/lib/api/client";
import type {
  PaymentTransaction,
  PaginatedResult,
  PaymentQueryParams,
  CreatePaymentTransaction,
  UpdatePaymentTransaction,
} from "@/types/payment";

const ENDPOINT = "/PaymentTransactions";

export const paymentService = {
  getPaged: (query: PaymentQueryParams = {}) => {
    const params: Record<string, string> = {};
    if (query.page) params.Page = String(query.page);
    if (query.pageSize) params.PageSize = String(query.pageSize);
    if (query.search) params.Search = query.search;
    if (query.status) params.Status = query.status;
    if (query.paymentMethod) params.PaymentMethod = query.paymentMethod;
    if (query.dateFrom) params.DateFrom = query.dateFrom;
    if (query.dateTo) params.DateTo = query.dateTo;
    if (query.sortBy) params.SortBy = query.sortBy;
    if (query.sortDirection) params.SortDirection = query.sortDirection;

    return apiClient.get<PaginatedResult<PaymentTransaction>>(ENDPOINT, { params });
  },

  getById: (id: string) =>
    apiClient.get<PaymentTransaction>(`${ENDPOINT}/${id}`),

  create: (data: CreatePaymentTransaction) =>
    apiClient.post<PaymentTransaction>(ENDPOINT, data),

  update: (id: string, data: UpdatePaymentTransaction) =>
    apiClient.put<PaymentTransaction>(`${ENDPOINT}/${id}`, data),

  delete: (id: string) => apiClient.delete(`${ENDPOINT}/${id}`),
};
