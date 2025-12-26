import { useState, useEffect, useCallback } from 'react';
import { fetchLeaveRequests } from '../services/leaveApi';
import type { LeaveFilters, LeaveRequestDisplay } from '../types/leave';

export const PAGE_SIZE = 10;

interface UseLeaveRequestsReturn {
  leaveRequests: LeaveRequestDisplay[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  filters: LeaveFilters;
  updateFilters: (newFilters: Partial<LeaveFilters>) => void;
  goToPage: (page: number) => void;
  refetch: () => Promise<void>;
}

export function useLeaveRequests(
  initialFilters?: LeaveFilters
): UseLeaveRequestsReturn {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState<LeaveFilters>(
    initialFilters || {}
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchLeaveRequests(filters, currentPage, PAGE_SIZE);
      setLeaveRequests(response.data);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch leave requests';
      setError(errorMessage);
      console.error('Error fetching leave requests:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateFilters = (newFilters: Partial<LeaveFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(0); // Reset to first page when filters change
  };

  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const refetch = async () => {
    await fetchData();
  };

  return {
    leaveRequests,
    loading,
    error,
    currentPage,
    totalPages,
    totalElements,
    filters,
    updateFilters,
    goToPage,
    refetch,
  };
}
