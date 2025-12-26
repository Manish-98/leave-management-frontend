/**
 * Format date to "Month Day, Year" format (e.g., "January 15, 2025")
 */
export function formatDateLong(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date to "Mon Day" format (e.g., "Jan 15")
 */
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date to "Month Day, Year" with time (e.g., "January 15, 2025 at 2:30 PM")
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Calculate number of days between two dates
 */
export function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

/**
 * Get CSS class for status badge
 */
export function getStatusBadgeClass(status: string): string {
  const statusMap: Record<string, string> = {
    Approved: 'bg-success-100 text-success-700 border-success-200',
    Pending: 'bg-warning-100 text-warning-700 border-warning-200',
    Rejected: 'bg-error-100 text-error-700 border-error-200',
  };
  return statusMap[status] || 'bg-gray-100 text-gray-700 border-gray-200';
}

/**
 * Get CSS class for leave type badge
 */
export function getLeaveTypeBadgeClass(leaveType: string): string {
  const typeMap: Record<string, string> = {
    Annual: 'bg-primary-100 text-primary-700 border-primary-200',
    Sick: 'bg-success-100 text-success-700 border-success-200',
    Personal: 'bg-purple-100 text-purple-700 border-purple-200',
    Unpaid: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return typeMap[leaveType] || 'bg-gray-100 text-gray-700 border-gray-200';
}
