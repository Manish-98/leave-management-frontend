/**
 * Custom hook for employee management
 * Handles state, data fetching, and CRUD operations
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  Employee,
  EmployeeDisplay,
  EmployeeFilters,
  EmployeeCreateRequest,
} from '../types/employee';
import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deactivateEmployee,
} from '../services/employeeApi';
import { formatEmployeeDate } from '../utils/employeeFormatters';

const PAGE_SIZE = 20;

interface UseEmployeesResult {
  employees: EmployeeDisplay[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  filters: EmployeeFilters;
  updateFilters: (newFilters: Partial<EmployeeFilters>) => void;
  goToPage: (page: number) => void;
  refetch: () => Promise<void>;
  createNewEmployee: (data: EmployeeCreateRequest) => Promise<Employee>;
  updateExistingEmployee: (id: string, data: EmployeeCreateRequest) => Promise<Employee>;
  deactivateExistingEmployee: (id: string) => Promise<void>;
}

export function useEmployees(initialFilters?: EmployeeFilters): UseEmployeesResult {
  const [employees, setEmployees] = useState<EmployeeDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState<EmployeeFilters>(initialFilters || {});

  const fetchEmployeesData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchEmployees(filters, currentPage, PAGE_SIZE);

      // Get current year
      const currentYear = new Date().getFullYear().toString();

      // Transform employees to display format
      const employeesWithDisplay: EmployeeDisplay[] = result.data.map((emp) => ({
        ...emp,
        dateOfJoiningDisplay: formatEmployeeDate(emp.dateOfJoining),
        createdAtDisplay: formatEmployeeDate(emp.createdAt),
        activeDisplay: emp.active ? 'Active' : 'Inactive',
        carryForwardLeavesDisplay: emp.carryForwardLeaves?.[currentYear]?.toString() || '0',
      }));

      setEmployees(employeesWithDisplay);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch employees';
      setError(errorMessage);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchEmployeesData();
  }, [fetchEmployeesData]);

  const updateFilters = useCallback((newFilters: Partial<EmployeeFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(0); // Reset to first page when filters change
  }, []);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const refetch = useCallback(async () => {
    await fetchEmployeesData();
  }, [fetchEmployeesData]);

  const createNewEmployee = useCallback(async (data: EmployeeCreateRequest) => {
    try {
      const newEmployee = await createEmployee(data);
      await refetch(); // Refresh the list
      return newEmployee;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create employee';
      throw new Error(errorMessage);
    }
  }, [refetch]);

  const updateExistingEmployee = useCallback(async (id: string, data: EmployeeCreateRequest) => {
    try {
      const updatedEmployee = await updateEmployee(id, data);
      await refetch(); // Refresh the list
      return updatedEmployee;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update employee';
      throw new Error(errorMessage);
    }
  }, [refetch]);

  const deactivateExistingEmployee = useCallback(async (id: string) => {
    try {
      await deactivateEmployee(id);
      await refetch(); // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deactivate employee';
      throw new Error(errorMessage);
    }
  }, [refetch]);

  return {
    employees,
    loading,
    error,
    currentPage,
    totalPages,
    totalElements,
    filters,
    updateFilters,
    goToPage,
    refetch,
    createNewEmployee,
    updateExistingEmployee,
    deactivateExistingEmployee,
  };
}
