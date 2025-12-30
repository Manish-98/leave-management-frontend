/**
 * EmployeeManagement Component
 * Main container for employee management dashboard
 */

import { useState } from 'react';
import { useEmployees } from '../../hooks/useEmployees';
import { EmployeeFilterBar } from './EmployeeFilterBar';
import { EmployeeTable } from './EmployeeTable';
import { EmployeeModal } from './EmployeeModal';
import { EmployeeBulkUploadModal } from './EmployeeBulkUploadModal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { Button } from '../common/Button';
import type { EmployeeDisplay, EmployeeCreateRequest } from '../../types/employee';

export function EmployeeManagement() {
  const {
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
  } = useEmployees();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeDisplay | null>(null);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeDisplay | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleOpenCreateModal = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
    setSubmitError(null);
  };

  const handleOpenEditModal = (employee: EmployeeDisplay) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
    setSubmitError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setSubmitError(null);
  };

  const handleOpenBulkUpload = () => {
    setIsBulkUploadModalOpen(true);
  };

  const handleCloseBulkUpload = () => {
    setIsBulkUploadModalOpen(false);
  };

  const handleOpenDeleteConfirm = (employee: EmployeeDisplay) => {
    setEmployeeToDelete(employee);
  };

  const handleCloseDeleteConfirm = () => {
    setEmployeeToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await deactivateExistingEmployee(employeeToDelete.id);
      handleCloseDeleteConfirm();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deactivate employee';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEmployee = async (data: EmployeeCreateRequest) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (editingEmployee) {
        await updateExistingEmployee(editingEmployee.id, data);
      } else {
        await createNewEmployee(data);
      }
      handleCloseModal();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save employee';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage employee records, add new employees, and perform bulk uploads
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={handleOpenBulkUpload}
            className="flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
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
            Bulk Upload
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Employee
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <EmployeeFilterBar filters={filters} onFilterChange={updateFilters} />

      {/* Employee Table */}
      <EmployeeTable
        employees={employees}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={goToPage}
        onEdit={handleOpenEditModal}
        onDeactivate={handleOpenDeleteConfirm}
      />

      {/* Employee Modal (Create/Edit) */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitEmployee}
        employee={editingEmployee || undefined}
      />

      {/* Bulk Upload Modal */}
      <EmployeeBulkUploadModal
        isOpen={isBulkUploadModalOpen}
        onClose={handleCloseBulkUpload}
        onUploadSuccess={refetch}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!employeeToDelete}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to deactivate "${employeeToDelete?.name}"? This action can be reverted by reactivating the employee.`}
        variant="warning"
        isLoading={isSubmitting}
      />

      {/* Submit Error Modal */}
      {submitError && (
        <ConfirmationModal
          isOpen={!!submitError}
          onClose={() => setSubmitError(null)}
          onConfirm={() => setSubmitError(null)}
          message={submitError}
          variant="danger"
          confirmText="OK"
        />
      )}
    </div>
  );
}
