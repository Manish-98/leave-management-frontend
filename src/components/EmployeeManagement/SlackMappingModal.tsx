/**
 * SlackMappingModal Component
 * Allows mapping Slack users to employees with auto-suggestions
 */

import { useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useSlackMapping } from '../../hooks/useSlackMapping';
import { getConfidenceLabel, getConfidenceColor } from '../../utils/slackMatching';
import type { Employee } from '../../types/employee';

interface SlackMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onMappingComplete: () => void;
}

export function SlackMappingModal({
  isOpen,
  onClose,
  employees,
  onMappingComplete,
}: SlackMappingModalProps) {
  const {
    isLoading,
    isUpdating,
    error,
    suggestions,
    mappingStates,
    updateProgress,
    completedCount,
    generateSuggestions,
    updateMappingState,
    executeMappings,
    reset,
  } = useSlackMapping();

  // Generate suggestions when modal opens
  useEffect(() => {
    if (isOpen && suggestions.length === 0 && !isLoading) {
      generateSuggestions(employees);
    }
  }, [isOpen, suggestions.length, isLoading, employees, generateSuggestions]);

  // Handle close with callback
  const handleClose = () => {
    onClose();
    if (completedCount > 0) {
      onMappingComplete();
    }
    reset();
  };

  // Handle mapping state change
  const handleMappingChange = (employeeId: string, action: 'APPROVE' | 'CHOOSE' | 'SKIP', slackUser?: any) => {
    updateMappingState(employeeId, {
      employeeId,
      selectedSlackUser: slackUser || null,
      action,
    });
  };

  // Filter employees without Slack IDs
  const employeesWithoutSlack = employees.filter(emp => !emp.slackId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Map Slack Users to Employees"
      size="xl"
      footer={
        !isLoading && completedCount === 0 && (
          <>
            <Button variant="outline" onClick={handleClose} disabled={isUpdating}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={executeMappings}
              disabled={isUpdating || suggestions.length === 0}
            >
              {isUpdating
                ? `Mapping ${updateProgress.current}/${updateProgress.total}...`
                : `Map Selected (${Array.from(mappingStates.values()).filter(s => s.action !== 'SKIP').length})`}
            </Button>
          </>
        )
      }
    >
      <div className="space-y-4">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
            <p className="text-gray-600">Fetching Slack users and generating suggestions...</p>
          </div>
        )}

        {/* Success State */}
        {completedCount > 0 && !isUpdating && (
          <div className="bg-success-50 border border-success-200 rounded-lg p-6 text-center">
            <svg
              className="mx-auto h-12 w-12 text-success-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-success-900 mb-2">Mapping Complete!</h3>
            <p className="text-success-700 mb-4">
              Successfully mapped {completedCount} employee{completedCount !== 1 ? 's' : ''} to Slack users
            </p>
            <Button variant="primary" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-error-50 border border-error-200 rounded-lg p-4">
            <div className="flex">
              <svg
                className="h-5 w-5 text-error-400 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-error-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - List of Suggestions */}
        {!isLoading && completedCount === 0 && suggestions.length > 0 && (
          <>
            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                Found <strong>{employeesWithoutSlack.length}</strong> employee{employeesWithoutSlack.length !== 1 ? 's' : ''} without Slack IDs.
                Generated <strong>{suggestions.filter(s => s.suggestedSlackUser).length}</strong> suggestion{suggestions.filter(s => s.suggestedSlackUser).length !== 1 ? 's' : ''}.
              </p>
            </div>

            {/* Suggestions List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {suggestions.map((suggestion) => {
                const mappingState = mappingStates.get(suggestion.employee.id) || {
                  action: 'SKIP',
                  selectedSlackUser: null,
                };

                return (
                  <div
                    key={suggestion.employee.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Employee Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {suggestion.employee.name}
                          </h4>
                          {suggestion.employee.googleId && (
                            <span className="text-xs text-gray-500">
                              ({suggestion.employee.googleId})
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {suggestion.employee.region} • Joined {new Date(suggestion.employee.dateOfJoining).getFullYear()}
                        </p>
                      </div>

                      {/* Suggested Match */}
                      {suggestion.suggestedSlackUser ? (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                                ${getConfidenceColor(suggestion.confidence) === 'green' ? 'bg-success-100 text-success-800' :
                                  getConfidenceColor(suggestion.confidence) === 'blue' ? 'bg-blue-100 text-blue-800' :
                                  getConfidenceColor(suggestion.confidence) === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                  getConfidenceColor(suggestion.confidence) === 'orange' ? 'bg-orange-100 text-orange-800' :
                                  'bg-gray-100 text-gray-800'}
                              `}
                            >
                              {getConfidenceLabel(suggestion.confidence)} ({suggestion.confidenceScore}%)
                            </span>
                          </div>

                          <div className="bg-white border border-gray-200 rounded-md p-2">
                            <p className="text-sm font-medium text-gray-900">
                              {suggestion.suggestedSlackUser.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              @{suggestion.suggestedSlackUser.displayName}
                            </p>
                            <p className="text-xs text-gray-400">
                              {suggestion.suggestedSlackUser.email}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 italic">No match found</p>
                        </div>
                      )}

                      {/* Action Dropdown */}
                      <div className="w-48">
                        <select
                          value={mappingState.action}
                          onChange={(e) => {
                            const action = e.target.value as 'APPROVE' | 'CHOOSE' | 'SKIP';
                            if (action === 'APPROVE') {
                              handleMappingChange(suggestion.employee.id, 'APPROVE', suggestion.suggestedSlackUser);
                            } else if (action === 'SKIP') {
                              handleMappingChange(suggestion.employee.id, 'SKIP');
                            } else if (action === 'CHOOSE') {
                              // For now, just approve - can be enhanced with full dropdown
                              handleMappingChange(suggestion.employee.id, 'APPROVE', suggestion.suggestedSlackUser);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          disabled={!suggestion.suggestedSlackUser}
                        >
                          <option value="SKIP">Skip</option>
                          {suggestion.suggestedSlackUser && (
                            <>
                              <option value="APPROVE">Approve Suggestion</option>
                              {suggestion.alternativeSlackUsers.length > 0 && (
                                <option value="CHOOSE">Choose Alternative...</option>
                              )}
                            </>
                          )}
                        </select>

                        {/* Alternative Matches */}
                        {mappingState.action === 'CHOOSE' && suggestion.alternativeSlackUsers.length > 0 && (
                          <select
                            onChange={(e) => {
                              const selectedUser = suggestion.alternativeSlackUsers[parseInt(e.target.value)];
                              handleMappingChange(suggestion.employee.id, 'APPROVE', selectedUser);
                            }}
                            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value="">Select alternative...</option>
                            {suggestion.alternativeSlackUsers.map((altUser, idx) => (
                              <option key={altUser.slackId} value={idx}>
                                {altUser.name} (@{altUser.displayName})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* No Suggestions */}
        {!isLoading && completedCount === 0 && suggestions.length === 0 && !error && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Employees to Map</h3>
            <p className="text-gray-500">
              All employees already have Slack IDs assigned
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
