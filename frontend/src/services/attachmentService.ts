import { apiClient } from "@/lib/api/client";
import type { TransactionAttachment } from "@/types/attachment";

const EP = "/TransactionAttachments";

export const attachmentService = {
  getByTransaction: (transactionId: string) =>
    apiClient.get<TransactionAttachment[]>(`${EP}/transaction/${transactionId}`),

  upload: async (transactionId: string, files: File[]): Promise<TransactionAttachment[]> => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));

    return apiClient.postFormData<TransactionAttachment[]>(
      `${EP}/transaction/${transactionId}`,
      formData
    );
  },

  delete: (attachmentId: string) =>
    apiClient.delete<void>(`${EP}/${attachmentId}`),
};
