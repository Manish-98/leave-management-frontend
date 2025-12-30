/**
 * EmployeeBulkUploadModal Component
 * Enhanced bulk upload with CSV template download, file preview, and job tracking
 */

import { useState, useRef, useCallback } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  bulkUploadEmployees,
  fetchBulkUploadStatus,
  downloadBulkUploadResult,
  parseResultCsv,
} from '../../services/employeeApi';
import {
  generateEmployeeCsvTemplate,
  downloadCsvFile,
  parseEmployeeCsv,
  validateEmployeeRow,
} from '../../utils/employeeFormatters';
import type { BulkUploadJob, BulkUploadResultRow } from '../../types/employee';

interface EmployeeBulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

interface CsvRow {
  [key: string]: string;
}

export function EmployeeBulkUploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
}: EmployeeBulkUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadSummary, setUploadSummary] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<CsvRow[]>([]);
  const [previewErrors, setPreviewErrors] = useState<Record<number, string[]>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Job tracking state
  const [submittedJobs, setSubmittedJobs] = useState<BulkUploadJob[]>([]);
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
  const [loadingResult, setLoadingResult] = useState<string | null>(null);
  const [resultData, setResultData] = useState<BulkUploadResultRow[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];

    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file);
      setUploadError(null);
      previewFile(file);
    } else {
      setUploadError('Please select a CSV file');
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
      previewFile(file);
    }
  }, []);

  const previewFile = async (file: File) => {
    try {
      const data = await parseEmployeeCsv(file);
      const previewRows = data.slice(0, 5);

      // Validate rows
      const errors: Record<number, string[]> = {};
      previewRows.forEach((row, index) => {
        const validation = validateEmployeeRow(row);
        if (!validation.valid) {
          errors[index] = validation.errors;
        }
      });

      setPreviewData(previewRows);
      setPreviewErrors(errors);
    } catch (error) {
      setUploadError('Failed to parse CSV file. Please check the format.');
      setPreviewData([]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewData([]);
    setPreviewErrors({});
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    const template = generateEmployeeCsvTemplate();
    downloadCsvFile(template, 'employee-bulk-upload-template.csv');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await bulkUploadEmployees(selectedFile);

      // Add job to submitted jobs list
      const newJob: BulkUploadJob = {
        jobId: response.jobId,
        timestamp: new Date(),
        totalRecords: response.totalRecords,
        status: response.status,
        resultAvailable: response.resultAvailable,
      };
      setSubmittedJobs((prev) => [newJob, ...prev]);

      setUploadSuccess(true);
      setUploadSummary(
        `Bulk upload submitted successfully! Job ID: ${response.jobId}. Processing ${response.totalRecords} records...`
      );

      // Refresh the employee list
      onUploadSuccess();

      // Clear file selection to allow new uploads
      setSelectedFile(null);
      setPreviewData([]);
      setPreviewErrors({});
    } catch (error) {
      setUploadError('Failed to upload CSV. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewData([]);
    setPreviewErrors({});
    setUploadError(null);
    setUploadSuccess(false);
    setUploadSummary(null);
    setIsDragging(false);
    setSubmittedJobs([]);
    setResultData([]);
    setSelectedJobId(null);
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleCheckStatus = async (jobId: string) => {
    setLoadingStatus(jobId);
    try {
      const status = await fetchBulkUploadStatus(jobId);

      // Update the job in the list
      setSubmittedJobs((prev) =>
        prev.map((job) =>
          job.jobId === jobId
            ? { ...job, status: status.status, resultAvailable: status.resultAvailable }
            : job
        )
      );
    } catch (error) {
      console.error('Status check error:', error);
      setUploadError('Failed to check job status. Please try again.');
    } finally {
      setLoadingStatus(null);
    }
  };

  const handleViewResults = async (jobId: string) => {
    setLoadingResult(jobId);
    setSelectedJobId(jobId);
    setResultData([]);

    try {
      const csvText = await downloadBulkUploadResult(jobId);
      const parsedData = parseResultCsv(csvText);
      setResultData(parsedData);
    } catch (error) {
      console.error('Result fetch error:', error);
      setUploadError('Failed to fetch results. Please try again.');
    } finally {
      setLoadingResult(null);
    }
  };

  const handleDownloadResults = async (jobId: string) => {
    try {
      const csvText = await downloadBulkUploadResult(jobId);
      downloadCsvFile(csvText, `employee-bulk-upload-result-${jobId}.csv`);
    } catch (error) {
      console.error('Download error:', error);
      setUploadError('Failed to download results. Please try again.');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PROCESSING':
        return 'bg-warning-100 text-warning-700 border-warning-200';
      case 'COMPLETED':
        return 'bg-success-100 text-success-700 border-success-200';
      case 'FAILED':
        return 'bg-error-100 text-error-700 border-error-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Bulk Upload Employees"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload CSV'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">CSV Format Requirements:</h3>
          <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
            <li>File must be in CSV format</li>
            <li>
              Required columns: name, dateOfJoining
            </li>
            <li>Optional columns: slackId, googleId, slackDisplayName, active, carryForwardLeaves</li>
            <li>Date format: YYYY-MM-DD</li>
            <li>carryForwardLeaves must be valid JSON (e.g., {"{"}"2024": 5{"}"})</li>
          </ul>
          <button
            onClick={handleDownloadTemplate}
            className="mt-3 text-xs text-primary-600 hover:text-primary-700 font-medium underline"
          >
            Download template
          </button>
        </div>

        {/* Upload Error */}
        {uploadError && (
          <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm">
            {uploadError}
          </div>
        )}

        {/* Upload Success */}
        {uploadSuccess && uploadSummary && (
          <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg text-sm">
            {uploadSummary}
          </div>
        )}

        {/* File Drop Zone */}
        {!selectedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50/50'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <svg
              className="w-12 h-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-gray-600 mb-1">Drag & drop CSV file here</p>
            <p className="text-xs text-gray-500">or click to browse</p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <svg
                    className="w-5 h-5 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                className="text-gray-400 hover:text-error-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Data Preview */}
            {previewData.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Preview (first 5 rows):</p>
                <div className="border border-gray-200 rounded-lg overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(previewData[0]).map((header) => (
                          <th
                            key={header}
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.map((row, index) => (
                        <tr key={index} className={previewErrors[index] ? 'bg-error-50' : ''}>
                          {Object.values(row).map((value, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-3 py-2 whitespace-nowrap text-xs text-gray-700"
                            >
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {Object.keys(previewErrors).length > 0 && (
                  <div className="mt-2 text-xs text-error-600">
                    <svg
                      className="w-4 h-4 inline mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Some rows have validation errors. Please review before uploading.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Submitted Jobs Section */}
        {submittedJobs.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Submitted Jobs</h3>
            <div className="space-y-3">
              {submittedJobs.map((job) => (
                <div
                  key={job.jobId}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-600 font-medium">
                          Job ID: {job.jobId}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusBadgeClass(
                            job.status
                          )}`}
                        >
                          {job.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTimestamp(job.timestamp)} • {job.totalRecords} records
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCheckStatus(job.jobId)}
                      disabled={loadingStatus === job.jobId}
                    >
                      {loadingStatus === job.jobId ? 'Checking...' : 'Check Status'}
                    </Button>

                    {job.status === 'COMPLETED' && job.resultAvailable && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewResults(job.jobId)}
                          disabled={loadingResult === job.jobId}
                        >
                          {loadingResult === job.jobId ? 'Loading...' : 'View Results'}
                        </Button>

                        {selectedJobId === job.jobId && resultData.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadResults(job.jobId)}
                          >
                            Download
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Preview */}
        {selectedJobId && resultData.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Results Preview</h3>
              <span className="text-xs text-gray-500">Showing {resultData.length} rows</span>
            </div>
            <div className="border border-gray-200 rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(resultData[0]).map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {resultData.slice(0, 10).map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-3 py-2 whitespace-nowrap text-xs text-gray-700"
                        >
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {resultData.length > 10 && (
              <p className="text-xs text-gray-500 mt-2">
                Showing first 10 of {resultData.length} rows. Download to see all results.
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
