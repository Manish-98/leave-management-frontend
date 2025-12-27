export interface BulkUploadResponse {
  jobId: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  resultAvailable: boolean;
}

export type BulkUploadStatusResponse = BulkUploadResponse;

export interface BulkUploadResultRow {
  userId: string;
  startDate: string;
  endDate: string;
  type: string;
  durationType: string;
  status: string;
}

/**
 * Upload CSV file for bulk leave request creation
 *
 * @param file - CSV file to upload
 * @returns Promise with upload response
 *
 * TODO: Update endpoint URL and request format based on your backend API
 */
export async function bulkUploadLeaves(
  file: File
): Promise<BulkUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    // TODO: Replace with your actual API endpoint
    // Example: const response = await fetch('/api/leaves/bulk-upload', {
    const response = await fetch('/api/leaves/bulk-upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
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
 *
 * @param jobId - Job ID to check status for
 * @returns Promise with status response
 */
export async function fetchBulkUploadStatus(
  jobId: string
): Promise<BulkUploadStatusResponse> {
  try {
    const response = await fetch(`/api/leaves/bulk-upload/status/${jobId}`);

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.status} ${response.statusText}`);
    }

    const data: BulkUploadStatusResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Status check error:', error);
    throw error;
  }
}

/**
 * Download bulk upload result CSV
 *
 * @param jobId - Job ID to download results for
 * @returns Promise with CSV text
 */
export async function downloadBulkUploadResult(
  jobId: string
): Promise<string> {
  try {
    const response = await fetch(`/api/leaves/bulk-download/${jobId}`);

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
 *
 * @param csvText - CSV text to parse
 * @returns Array of parsed row objects
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
    return row as unknown as BulkUploadResultRow;
  });

  return data;
}
