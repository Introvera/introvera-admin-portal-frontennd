import type { PaginatedResult } from "@/types/project";

// ── Enums ──────────────────────────────────────────────────────
export type ScheduleKind = "OneTime" | "Delay" | "IntervalDays" | "MonthlyDay";
export type ScheduleStatus = "Draft" | "Scheduled" | "Paused" | "Completed" | "Cancelled";
export type RecipientType = "PhoneNumber" | "UserId";
export type MessageLogStatusType = "Queued" | "Sent" | "Delivered" | "Read" | "Failed";

// ── Constants ──────────────────────────────────────────────────
export const SCHEDULE_KINDS: { value: ScheduleKind; label: string }[] = [
  { value: "OneTime", label: "One-time" },
  { value: "Delay", label: "Delay" },
  { value: "IntervalDays", label: "Every N Days" },
  { value: "MonthlyDay", label: "Monthly (Day)" },
];

export const SCHEDULE_STATUSES: ScheduleStatus[] = ["Draft", "Scheduled", "Paused", "Completed", "Cancelled"];

export const SCHEDULE_STATUS_VARIANT: Record<ScheduleStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Draft: "outline",
  Scheduled: "default",
  Paused: "secondary",
  Completed: "default",
  Cancelled: "destructive",
};

export const LOG_STATUS_VARIANT: Record<MessageLogStatusType, "default" | "secondary" | "destructive" | "outline"> = {
  Queued: "outline",
  Sent: "default",
  Delivered: "default",
  Read: "secondary",
  Failed: "destructive",
};

// ── Interfaces ─────────────────────────────────────────────────
export interface ScheduledMessage {
  id: string;
  title: string;
  recipientType: RecipientType;
  recipientValue?: string;
  templateId: string;
  templateName: string;
  languageCode: string;
  templateVarsJson?: string;
  conditionJson?: string;
  scheduleKind: ScheduleKind;
  sendAtUtc?: string;
  delaySeconds?: number;
  everyNDays?: number;
  dayOfMonth?: number;
  timeOfDayUtc?: string;
  startAtUtc?: string;
  endAtUtc?: string;
  status: ScheduleStatus;
  nextRunAtUtc?: string;
  lastRunAtUtc?: string;
  createdAt: string;
  updatedAtUtc: string;
  createdBy?: string;
  templateIsActive: boolean;
}

export interface CreateScheduledMessage {
  title: string;
  recipientType: RecipientType;
  recipientValue?: string;
  templateId: string;
  templateVarsJson?: string;
  conditionJson?: string;
  scheduleKind: ScheduleKind;
  sendAtUtc?: string;
  delaySeconds?: number;
  everyNDays?: number;
  dayOfMonth?: number;
  timeOfDayUtc?: string;
  startAtUtc?: string;
  endAtUtc?: string;
  activate: boolean;
}

export interface UpdateScheduledMessage {
  title: string;
  recipientType: RecipientType;
  recipientValue?: string;
  templateId: string;
  templateVarsJson?: string;
  conditionJson?: string;
  scheduleKind: ScheduleKind;
  sendAtUtc?: string;
  delaySeconds?: number;
  everyNDays?: number;
  dayOfMonth?: number;
  timeOfDayUtc?: string;
  startAtUtc?: string;
  endAtUtc?: string;
  activate: boolean;
}

export interface ScheduledMessageQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  scheduleKind?: string;
  templateId?: string;
  sortBy?: string;
  sortDirection?: string;
}

export interface MessageLog {
  id: string;
  scheduledMessageId?: string;
  outboxId?: string;
  toPhone: string;
  provider: string;
  providerMessageId?: string;
  templateName: string;
  status: MessageLogStatusType;
  error?: string;
  attemptCount: number;
  createdAtUtc: string;
}

export interface MessageLogQueryParams {
  page?: number;
  pageSize?: number;
  status?: string;
}

export type { PaginatedResult };
