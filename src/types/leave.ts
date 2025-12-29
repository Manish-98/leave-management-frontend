// Leave Type (matches API)
export const LeaveType = {
  ANNUAL_LEAVE: 'ANNUAL_LEAVE',
  OPTIONAL_HOLIDAY: 'OPTIONAL_HOLIDAY',
} as const;

export type LeaveType = (typeof LeaveType)[keyof typeof LeaveType];

// Leave Status (matches API)
export const LeaveStatus = {
  APPROVED: 'APPROVED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
} as const;

export type LeaveStatus = (typeof LeaveStatus)[keyof typeof LeaveStatus];

// Duration Type
export const DurationType = {
  FULL_DAY: 'FULL_DAY',
  HALF_DAY: 'HALF_DAY',
} as const;

export type DurationType = (typeof DurationType)[keyof typeof DurationType];

// Date Range from API
export interface DateRange {
  startDate: string;
  endDate: string;
}

// Source Reference from API
export interface SourceRef {
  id: string;
  sourceType: string;
  sourceId: string;
}

// Leave Request from API
export interface LeaveRequest {
  id: string;
  userId: string;
  dateRange: DateRange;
  type: LeaveType;
  status: LeaveStatus;
  durationType: DurationType;
  sourceRefs: SourceRef[];
  durationInDays: number;
  endDate: string;
  startDate: string;
}

// Pagination info from Spring Boot API
export interface PageInfo {
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  unpaged: boolean;
}

export interface SortInfo {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

// API Response wrapper (Spring Boot pagination format)
export interface LeaveApiResponse {
  content: LeaveRequest[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    sort: SortInfo;
    unpaged: boolean;
  };
  size: number;
  sort: SortInfo;
  totalElements: number;
  totalPages: number;
}

// Frontend-friendly Leave Request (computed fields)
export interface LeaveRequestDisplay extends LeaveRequest {
  leaveTypeDisplay: string;
  statusDisplay: string;
}

// Filter options
export interface LeaveFilters {
  userId?: string;
  year?: number;
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
}

// Pagination params for API
export interface PaginationParams {
  page: number;
  size: number;
}

// View mode (admin vs employee)
export type ViewMode = 'admin' | 'employee';
