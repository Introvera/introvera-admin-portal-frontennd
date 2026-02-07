export interface TransactionAttachment {
  id: string;
  transactionId: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  downloadUrl: string;
  createdAt: string;
}
