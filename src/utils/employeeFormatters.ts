/**
 * Employee utility functions
 * Handles date formatting, CSV parsing, and template generation
 */

import type { BulkUploadResultRow } from '../types/employee';

/**
 * Format ISO date string to readable format
 * Reuses formatters from utils/formatters.ts if available
 */
export function formatEmployeeDate(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) return dateString;

  // Format: "January 15, 2025"
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Parse CSV file to array of objects
 * Reuses the same pattern as bulkUploadApi.ts
 */
export function parseEmployeeCsv(file: File): Promise<BulkUploadResultRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter((line) => line.trim());

        if (lines.length === 0) {
          resolve([]);
          return;
        }

        const headers = lines[0].split(',');
        const data = lines.slice(1).map((line) => {
          const values = line.split(',');
          const row: Record<string, string> = {};
          headers.forEach((header, index) => {
            row[header.trim()] = values[index]?.trim() || '';
          });
          return row;
        });

        resolve(data);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Generate CSV template for employee bulk upload
 */
export function generateEmployeeCsvTemplate(): string {
  const headers = ['name', 'slackId', 'googleId', 'slackDisplayName', 'dateOfJoining', 'region', 'active', 'carryForwardLeaves'];
  const exampleRow1 = ['John Doe', 'johndoe', '', 'John Doe', '2025-01-15', 'PUNE', 'true', '{"2024": 5}'];
  const exampleRow2 = ['Jane Smith', '', 'janesmith@gmail.com', 'Jane Smith', '2025-02-01', 'BANGALORE', 'true', '{}'];
  const exampleRow3 = ['Bob Johnson', 'bjohnson', '', 'Bob Johnson', '2024-06-15', 'HYDERABAD', 'false', '{"2023": 3, "2024": 2}'];

  return [
    headers.join(','),
    exampleRow1.join(','),
    exampleRow2.join(','),
    exampleRow3.join(','),
  ].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCsvFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Validate employee data from CSV row
 */
export function validateEmployeeRow(row: Record<string, string>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!row.name || row.name.trim() === '') {
    errors.push('Name is required');
  }

  if (!row.dateOfJoining || row.dateOfJoining.trim() === '') {
    errors.push('Date of joining is required');
  } else {
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(row.dateOfJoining)) {
      errors.push('Date of joining must be in YYYY-MM-DD format');
    }
  }

  if (!row.region || row.region.trim() === '') {
    errors.push('Region is required');
  } else {
    const validRegions = ['PUNE', 'BANGALORE', 'HYDERABAD'];
    if (!validRegions.includes(row.region.trim().toUpperCase())) {
      errors.push('Region must be one of: PUNE, BANGALORE, HYDERABAD');
    }
  }

  // Optional: Validate carryForwardLeaves JSON
  if (row.carryForwardLeaves && row.carryForwardLeaves.trim() !== '') {
    try {
      JSON.parse(row.carryForwardLeaves);
    } catch {
      errors.push('Carry forward leaves must be valid JSON (e.g., {"2024": 5})');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format carry forward leaves for display
 */
export function formatCarryForwardLeaves(leaves: Record<string, number>): string {
  if (!leaves || Object.keys(leaves).length === 0) {
    return 'None';
  }

  const entries = Object.entries(leaves)
    .sort(([a], [b]) => b.localeCompare(a)) // Sort by year descending
    .map(([year, count]) => `${year}: ${count}`);

  return entries.join(', ');
}
