import type {
  OptionalHoliday,
  CreateOptionalHolidayRequest,
  UpdateOptionalHolidayRequest,
} from '../types/optionalHoliday';

// API base URL - use empty string for relative path (Vite proxy will handle it)
const API_BASE_URL = import.meta.env.PROD ? '' : '';

/**
 * Fetch all optional holidays
 *
 * @returns Promise with array of optional holidays
 */
export async function fetchAllOptionalHolidays(): Promise<OptionalHoliday[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/optional-holidays`);

    if (!response.ok) {
      throw new Error(`Failed to fetch optional holidays: ${response.status} ${response.statusText}`);
    }

    const data: OptionalHoliday[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching optional holidays:', error);
    throw error;
  }
}

/**
 * Create a new optional holiday
 *
 * @param holidayData - Holiday details to create
 * @returns Promise with created holiday
 */
export async function createOptionalHoliday(
  holidayData: CreateOptionalHolidayRequest
): Promise<OptionalHoliday> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/optional-holidays`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(holidayData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create optional holiday: ${response.status} ${response.statusText}`);
    }

    const data: OptionalHoliday = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating optional holiday:', error);
    throw error;
  }
}

/**
 * Update an existing optional holiday
 *
 * @param id - Holiday UUID
 * @param holidayData - Updated holiday details
 * @returns Promise with updated holiday
 */
export async function updateOptionalHoliday(
  id: string,
  holidayData: UpdateOptionalHolidayRequest
): Promise<OptionalHoliday> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/optional-holidays/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(holidayData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update optional holiday: ${response.status} ${response.statusText}`);
    }

    const data: OptionalHoliday = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating optional holiday:', error);
    throw error;
  }
}

/**
 * Delete an optional holiday
 *
 * @param id - Holiday UUID
 * @returns Promise when deletion is complete
 */
export async function deleteOptionalHoliday(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/optional-holidays/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete optional holiday: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting optional holiday:', error);
    throw error;
  }
}
