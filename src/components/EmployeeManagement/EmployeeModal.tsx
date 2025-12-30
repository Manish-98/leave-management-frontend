/**
 * EmployeeModal Component
 * Form for creating and editing employees
 */

import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { Employee, EmployeeCreateRequest } from '../../types/employee';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeCreateRequest) => Promise<void>;
  employee?: Employee; // If provided, editing mode; if not, creating mode
}

interface FormErrors {
  name?: string;
  dateOfJoining?: string;
  carryForwardLeaves?: string;
}

export function EmployeeModal({ isOpen, onClose, onSubmit, employee }: EmployeeModalProps) {
  const isEditing = !!employee;

  const [formData, setFormData] = useState<EmployeeCreateRequest>({
    name: '',
    slackId: '',
    googleId: '',
    slackDisplayName: '',
    dateOfJoining: '',
    active: true,
    carryForwardLeaves: undefined,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or employee changes
  useEffect(() => {
    if (isOpen) {
      if (employee) {
        // Editing mode - populate with existing data
        setFormData({
          name: employee.name,
          slackId: employee.slackId || '',
          googleId: employee.googleId || '',
          slackDisplayName: employee.slackDisplayName || '',
          dateOfJoining: employee.dateOfJoining.split('T')[0], // Format to YYYY-MM-DD
          active: employee.active,
          carryForwardLeaves: employee.carryForwardLeaves,
        });
      } else {
        // Creating mode - reset to default values
        setFormData({
          name: '',
          slackId: '',
          googleId: '',
          slackDisplayName: '',
          dateOfJoining: '',
          active: true,
          carryForwardLeaves: undefined,
        });
      }
      setErrors({});
    }
  }, [isOpen, employee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    // Clear error for this field when user starts typing
    if (name in errors) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.dateOfJoining) {
      newErrors.dateOfJoining = 'Date of joining is required';
    } else {
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.dateOfJoining)) {
        newErrors.dateOfJoining = 'Invalid date format (use YYYY-MM-DD)';
      }
    }

    // Validate carryForwardLeaves JSON
    if (formData.carryForwardLeaves) {
      try {
        JSON.parse(formData.carryForwardLeaves);
      } catch {
        newErrors.carryForwardLeaves = 'Invalid JSON format (e.g., {"2024": 5})';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Prepare data - remove empty optional fields
      const dataToSubmit: EmployeeCreateRequest = {
        name: formData.name,
        dateOfJoining: formData.dateOfJoining,
        active: formData.active,
      };

      if (formData.slackId) dataToSubmit.slackId = formData.slackId;
      if (formData.googleId) dataToSubmit.googleId = formData.googleId;
      if (formData.slackDisplayName) dataToSubmit.slackDisplayName = formData.slackDisplayName;
      if (formData.carryForwardLeaves) {
        dataToSubmit.carryForwardLeaves = JSON.parse(formData.carryForwardLeaves as string);
      }

      await onSubmit(dataToSubmit);
      onClose();
    } catch (error) {
      console.error('Error submitting employee:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Employee' : 'Add New Employee'}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Employee' : 'Create Employee'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-error-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.name ? 'border-error-500' : 'border-gray-300'
            }`}
            placeholder="Enter employee name"
          />
          {errors.name && <p className="mt-1 text-xs text-error-600">{errors.name}</p>}
        </div>

        {/* Slack ID */}
        <div>
          <label htmlFor="slackId" className="block text-sm font-medium text-gray-700 mb-1">
            Slack ID
          </label>
          <input
            id="slackId"
            name="slackId"
            type="text"
            value={formData.slackId || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter Slack username"
          />
        </div>

        {/* Google ID */}
        <div>
          <label htmlFor="googleId" className="block text-sm font-medium text-gray-700 mb-1">
            Google ID
          </label>
          <input
            id="googleId"
            name="googleId"
            type="text"
            value={formData.googleId || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter Google email"
          />
        </div>

        {/* Slack Display Name */}
        <div>
          <label htmlFor="slackDisplayName" className="block text-sm font-medium text-gray-700 mb-1">
            Slack Display Name
          </label>
          <input
            id="slackDisplayName"
            name="slackDisplayName"
            type="text"
            value={formData.slackDisplayName || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter display name"
          />
        </div>

        {/* Date of Joining */}
        <div>
          <label htmlFor="dateOfJoining" className="block text-sm font-medium text-gray-700 mb-1">
            Date of Joining <span className="text-error-500">*</span>
          </label>
          <input
            id="dateOfJoining"
            name="dateOfJoining"
            type="date"
            value={formData.dateOfJoining}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.dateOfJoining ? 'border-error-500' : 'border-gray-300'
            }`}
          />
          {errors.dateOfJoining && <p className="mt-1 text-xs text-error-600">{errors.dateOfJoining}</p>}
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            id="active"
            name="active"
            type="checkbox"
            checked={formData.active}
            onChange={handleChange}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="active" className="ml-2 text-sm font-medium text-gray-700">
            Active Employee
          </label>
        </div>

        {/* Carry Forward Leaves */}
        <div>
          <label htmlFor="carryForwardLeaves" className="block text-sm font-medium text-gray-700 mb-1">
            Carry Forward Leaves (JSON)
          </label>
          <textarea
            id="carryForwardLeaves"
            name="carryForwardLeaves"
            value={
              formData.carryForwardLeaves
                ? JSON.stringify(formData.carryForwardLeaves, null, 2)
                : ''
            }
            onChange={handleChange}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono ${
              errors.carryForwardLeaves ? 'border-error-500' : 'border-gray-300'
            }`}
            placeholder='e.g., {"2024": 5, "2023": 3}'
          />
          {errors.carryForwardLeaves && (
            <p className="mt-1 text-xs text-error-600">{errors.carryForwardLeaves}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Optional: Enter leave balances as JSON object with year as key and days as value
          </p>
        </div>
      </form>
    </Modal>
  );
}
