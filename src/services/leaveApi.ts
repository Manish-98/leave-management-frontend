import type {
  LeaveApiResponse,
  LeaveFilters,
  LeaveRequestDisplay,
} from '../types/leave';
import { LeaveType, LeaveStatus } from '../types/leave';

// API base URL - use empty string for relative path (Vite proxy will handle it)
// or set to your backend URL for production
const API_BASE_URL = import.meta.env.PROD ? '' : '';

/**
 * Build query parameters from filters and pagination
 */
function buildQueryParams(
  filters?: LeaveFilters,
  page = 0,
  size = 20
): string {
  const params = new URLSearchParams();

  // Add pagination
  params.append('page', page.toString());
  params.append('size', size.toString());

  // Add filters
  if (filters?.userId) {
    params.append('userId', filters.userId);
  }

  if (filters?.year) {
    params.append('year', filters.year.toString());
  }

  if (filters?.quarter) {
    params.append('quarter', filters.quarter);
  }

  return params.toString();
}

/**
 * Map API leave type to display format
 */
function mapLeaveTypeDisplay(type: LeaveType): string {
  const typeMap: Record<LeaveType, string> = {
    [LeaveType.ANNUAL_LEAVE]: 'Annual',
    [LeaveType.OPTIONAL_HOLIDAY]: 'Optional Holiday',
  };
  return typeMap[type] || type;
}

/**
 * Map API status to display format
 */
function mapStatusDisplay(status: LeaveStatus): string {
  const statusMap: Record<LeaveStatus, string> = {
    [LeaveStatus.APPROVED]: 'Approved',
    [LeaveStatus.PENDING]: 'Pending',
    [LeaveStatus.REJECTED]: 'Rejected',
  };
  return statusMap[status] || status;
}

/**
 * Fetch leave requests from API
 */
export async function fetchLeaveRequests(
  filters?: LeaveFilters,
  page = 0,
  size = 20
): Promise<{
  data: LeaveRequestDisplay[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}> {
  try {
    const queryParams = buildQueryParams(filters, page, size);
    const url = `${API_BASE_URL}/api/leaves?${queryParams}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const apiResponse: LeaveApiResponse = await response.json();

    // Transform API response to display format
    const data: LeaveRequestDisplay[] = apiResponse.content.map((request) => ({
      ...request,
      leaveTypeDisplay: mapLeaveTypeDisplay(request.type),
      statusDisplay: mapStatusDisplay(request.status),
    }));

    return {
      data,
      totalElements: apiResponse.totalElements,
      totalPages: apiResponse.totalPages,
      currentPage: apiResponse.number,
    };
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    throw error;
  }
}
