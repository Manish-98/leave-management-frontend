/**
 * Employee API service layer
 * Handles all employee-related API calls
 */

import type {
  Employee,
  EmployeeCreateRequest,
  EmployeeFilters,
  EmployeePageResponse,
  BulkUploadResponse,
  BulkUploadResultRow,
} from '../types/employee';

/**
 * Build query parameters from filters and pagination
 */
function buildQueryParams(
  filters?: EmployeeFilters,
  page?: number,
  size?: number
): string {
  const params = new URLSearchParams();

  if (page !== undefined) params.append('page', page.toString());
  if (size !== undefined) params.append('size', size.toString());

  if (filters) {
    if (filters.name) params.append('name', filters.name);
    if (filters.active !== undefined) params.append('active', filters.active.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDir) params.append('sortDir', filters.sortDir);
  }

  return params.toString();
}

/**
 * Fetch paginated list of employees
 */
export async function fetchEmployees(
  filters?: EmployeeFilters,
  page = 0,
  size = 20
): Promise<{
  data: Employee[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}> {
  const queryParams = buildQueryParams(filters, page, size);

  try {
    const response = await fetch(`/api/employees?${queryParams}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch employees: ${response.status} ${response.statusText}`);
    }

    const apiResponse: EmployeePageResponse = await response.json();

    return {
      data: apiResponse.content,
      totalElements: apiResponse.totalElements,
      totalPages: apiResponse.totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
}

/**
 * Fetch a single employee by ID
 */
export async function fetchEmployeeById(id: string): Promise<Employee> {
  try {
    const response = await fetch(`/api/employees/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch employee: ${response.status} ${response.statusText}`);
    }

    const employee: Employee = await response.json();
    return employee;
  } catch (error) {
    console.error('Error fetching employee:', error);
    throw error;
  }
}

/**
 * Create a new employee
 */
export async function createEmployee(
  data: EmployeeCreateRequest
): Promise<Employee> {
  try {
    const response = await fetch('/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create employee: ${response.status} ${errorText}`);
    }

    const employee: Employee = await response.json();
    return employee;
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
}

/**
 * Update an existing employee
 */
export async function updateEmployee(
  id: string,
  data: EmployeeCreateRequest
): Promise<Employee> {
  try {
    const response = await fetch(`/api/employees/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update employee: ${response.status} ${errorText}`);
    }

    const employee: Employee = await response.json();
    return employee;
  } catch (error) {
    console.error('Error updating employee:', error);
    throw error;
  }
}

/**
 * Deactivate an employee (soft delete)
 */
export async function deactivateEmployee(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/employees/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to deactivate employee: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deactivating employee:', error);
    throw error;
  }
}

/**
 * Upload CSV file for bulk employee creation
 */
export async function bulkUploadEmployees(file: File): Promise<BulkUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/employees/bulk-upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Bulk upload failed: ${response.status} ${response.statusText}`);
    }

    const data: BulkUploadResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Bulk upload error:', error);
    throw error;
  }
}

/**
 * Fetch status of a bulk upload job
 */
export async function fetchBulkUploadStatus(jobId: string): Promise<BulkUploadResponse> {
  try {
    const response = await fetch(`/api/employees/bulk-upload/status/${jobId}`);

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.status} ${response.statusText}`);
    }

    const data: BulkUploadResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Status check error:', error);
    throw error;
  }
}

/**
 * Download bulk upload result CSV
 */
export async function downloadBulkUploadResult(jobId: string): Promise<string> {
  try {
    const response = await fetch(`/api/employees/bulk-download/${jobId}`);

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();
    return csvText;
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}

/**
 * Parse result CSV text into array of objects
 * Reuses the same pattern as bulkUploadApi.ts
 */
export function parseResultCsv(csvText: string): BulkUploadResultRow[] {
  const lines = csvText.split('\n').filter((line) => line.trim());

  if (lines.length === 0) return [];

  const headers = lines[0].split(',');
  const data = lines.slice(1).map((line) => {
    const values = line.split(',');
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || '';
    });
    return row;
  });

  return data;
}
