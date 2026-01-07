import { useState, useEffect, useCallback } from 'react';
import { Button } from '../common/Button';
import { OptionalHolidayTable } from './OptionalHolidayTable';
import { OptionalHolidayModal } from './OptionalHolidayModal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import {
  fetchAllOptionalHolidays,
  createOptionalHoliday,
  updateOptionalHoliday,
  deleteOptionalHoliday,
} from '../../services/optionalHolidayApi';
import type { OptionalHoliday } from '../../types/optionalHoliday';

export function OptionalHolidayManagement() {
  const [holidays, setHolidays] = useState<OptionalHoliday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<OptionalHoliday | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<OptionalHoliday | null>(null);

  const fetchHolidays = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllOptionalHolidays();
      setHolidays(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch optional holidays');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const handleAddClick = () => {
    setEditingHoliday(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (holiday: OptionalHoliday) => {
    setEditingHoliday(holiday);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (holiday: OptionalHoliday) => {
    setHolidayToDelete(holiday);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!holidayToDelete) return;

    try {
      await deleteOptionalHoliday(holidayToDelete.id);
      // Refresh the list
      await fetchHolidays();
      // Close modal
      setShowDeleteConfirm(false);
      setHolidayToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete optional holiday');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setHolidayToDelete(null);
  };

  const handleSave = async (data: { date: string; name: string; description: string; region: 'PUNE' | 'BANGALORE' | 'HYDERABAD' }) => {
    if (editingHoliday) {
      await updateOptionalHoliday(editingHoliday.id, data);
    } else {
      await createOptionalHoliday(data);
    }
    // Refresh the list
    await fetchHolidays();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingHoliday(null);
  };

  return (
    <div className="mt-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Optional Holidays Management</h2>
        <div className="flex-shrink-0">
          <Button
            variant="primary"
            size="md"
            onClick={handleAddClick}
            className="flex flex-row items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Holiday
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <OptionalHolidayTable
        holidays={holidays}
        loading={loading}
        error={error}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {/* Modal */}
      <OptionalHolidayModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        holiday={editingHoliday}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Optional Holiday"
        message={
          holidayToDelete
            ? `Are you sure you want to delete "${holidayToDelete.name}" on ${holidayToDelete.date}? This action cannot be undone.`
            : 'Are you sure you want to delete this optional holiday?'
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
