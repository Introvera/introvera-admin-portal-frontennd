import type { TransactionAttachment } from "@/types/attachment";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
const ENDPOINT = `${API_BASE_URL}/TransactionAttachments`;

export const attachmentService = {
  getByTransaction: async (transactionId: string): Promise<TransactionAttachment[]> => {
    const res = await fetch(`${ENDPOINT}/transaction/${transactionId}`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to load attachments");
    return res.json();
  },

  upload: async (transactionId: string, files: File[]): Promise<TransactionAttachment[]> => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));

    const res = await fetch(`${ENDPOINT}/transaction/${transactionId}`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Upload failed");
    }
    return res.json();
  },

  delete: async (attachmentId: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/${attachmentId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to delete attachment");
  },
};
