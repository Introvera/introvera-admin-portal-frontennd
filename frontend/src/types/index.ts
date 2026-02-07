/**
 * Common API response types matching the backend Result pattern.
 */
export interface ApiResult<T = void> {
  succeeded: boolean;
  errors: string[];
  data?: T;
}

/**
 * Pagination metadata for list endpoints.
 */
export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * Base entity type matching the backend BaseEntity.
 */
export interface BaseEntity {
  id: string;
  createdAt: string;
  createdBy?: string;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
}
