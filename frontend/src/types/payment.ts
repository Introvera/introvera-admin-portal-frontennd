export type PaymentStatus = "Pending" | "Completed" | "Failed" | "Refunded" | "Cancelled";
export type PaymentMethod = "Cash" | "CreditCard" | "DebitCard" | "BankTransfer" | "DigitalWallet" | "Other";

export interface PaymentTransaction {
  id: string;
  transactionReference: string;
  payerName: string;
  payerEmail?: string;
  description?: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionDate: string;
  notes?: string;
  projectId?: string;
  projectName?: string;
  createdAt: string;
  lastModifiedAt?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaymentQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  paymentMethod?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortDirection?: string;
}

export interface CreatePaymentTransaction {
  transactionReference: string;
  payerName: string;
  payerEmail?: string;
  description?: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionDate?: string;
  notes?: string;
  projectId?: string;
}

export interface UpdatePaymentTransaction extends CreatePaymentTransaction {}

export const PAYMENT_STATUSES: PaymentStatus[] = ["Pending", "Completed", "Failed", "Refunded", "Cancelled"];

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "Cash", label: "Cash" },
  { value: "CreditCard", label: "Credit Card" },
  { value: "DebitCard", label: "Debit Card" },
  { value: "BankTransfer", label: "Bank Transfer" },
  { value: "DigitalWallet", label: "Digital Wallet" },
  { value: "Other", label: "Other" },
];

export const STATUS_VARIANT: Record<PaymentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "outline",
  Completed: "default",
  Failed: "destructive",
  Refunded: "secondary",
  Cancelled: "secondary",
};
