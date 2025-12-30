/**
 * Employee type definitions
 * Based on Employee Management API specification
 */

/**
 * Employee entity from API response
 */
export interface Employee {
  id: string;
  name: string;
  slackId: string | null;
  googleId: string | null;
  slackDisplayName: string | null;
  dateOfJoining: string; // ISO date string
  active: boolean;
  carryForwardLeaves: Record<string, number>; // e.g., { "2023": 5, "2024": 3 }
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

/**
 * Employee create/update request
 */
export interface EmployeeCreateRequest {
  name: string;
  slackId?: string;
  googleId?: string;
  slackDisplayName?: string;
  dateOfJoining: string; // ISO date string
  active?: boolean;
  carryForwardLeaves?: Record<string, number>;
}

/**
 * Employee display format (with formatted fields)
 */
export interface EmployeeDisplay extends Employee {
  dateOfJoiningDisplay: string;
  createdAtDisplay: string;
  activeDisplay: string;
  carryForwardLeavesDisplay: string;
}

/**
 * Employee filters for API queries
 */
export interface EmployeeFilters {
  name?: string;
  active?: boolean;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

/**
 * Paginated employee list response
 */
export interface EmployeePageResponse {
  totalElements: number;
  totalPages: number;
  content: Employee[];
}

/**
 * Bulk upload job response
 */
export interface BulkUploadResponse {
  jobId: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  resultAvailable: boolean;
}

/**
 * Bulk upload job tracking state
 */
export interface BulkUploadJob {
  jobId: string;
  timestamp: Date;
  totalRecords: number;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  resultAvailable: boolean;
}

/**
 * Bulk upload result row
 */
export interface BulkUploadResultRow {
  [key: string]: string; // Dynamic keys based on CSV columns
}
