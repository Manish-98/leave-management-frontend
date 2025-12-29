import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { OptionalHoliday } from '../../types/optionalHoliday';

interface OptionalHolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { date: string; name: string; description: string }) => Promise<void>;
  holiday?: OptionalHoliday | null;
}

export function OptionalHolidayModal({
  isOpen,
  onClose,
  onSave,
  holiday,
}: OptionalHolidayModalProps) {
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens or holiday changes
  useEffect(() => {
    if (isOpen) {
      if (holiday) {
        setDate(holiday.date);
        setName(holiday.name);
        setDescription(holiday.description || '');
      } else {
        setDate('');
        setName('');
        setDescription('');
      }
      setError(null);
    }
  }, [isOpen, holiday]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!date.trim()) {
      setError('Date is required');
      return;
    }

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (name.length > 100) {
      setError('Name must be 100 characters or less');
      return;
    }

    if (description.length > 500) {
      setError('Description must be 500 characters or less');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave({ date: date.trim(), name: name.trim(), description: description.trim() });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save optional holiday');
    } finally {
      setIsSaving(false);
    }
  };

  const isEditMode = holiday !== null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Optional Holiday' : 'Add Optional Holiday'}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Date Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date <span className="text-error-500">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-error-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            placeholder="e.g., Christmas Eve"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">{name.length}/100 characters</p>
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Optional description for this holiday"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
          />
          <p className="text-xs text-gray-500 mt-1">{description.length}/500 characters</p>
        </div>
      </form>
    </Modal>
  );
}
