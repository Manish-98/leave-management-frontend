// Optional Holiday Data Transfer Object
export interface OptionalHoliday {
  id: string;
  date: string; // YYYY-MM-DD format
  name: string;
  description?: string;
  region: 'PUNE' | 'BANGALORE' | 'HYDERABAD';
}

// Request to create a new optional holiday
export interface CreateOptionalHolidayRequest {
  date: string;
  name: string;
  description?: string;
  region: 'PUNE' | 'BANGALORE' | 'HYDERABAD';
}

// Request to update an existing optional holiday
export interface UpdateOptionalHolidayRequest {
  date: string;
  name: string;
  description?: string;
  region: 'PUNE' | 'BANGALORE' | 'HYDERABAD';
}
