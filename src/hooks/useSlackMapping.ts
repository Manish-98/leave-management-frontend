/**
 * Custom hook for Slack-to-employee mapping functionality
 * Manages state for the mapping modal and operations
 */

import { useState, useCallback } from 'react';
import type {
  Employee,
  MatchSuggestion,
  EmployeeMappingState,
} from '../types/employee';
import { fetchSlackUsers, filterActiveSlackUsers } from '../services/slackApi';
import { findBestMatches } from '../utils/slackMatching';
import { updateEmployee } from '../services/employeeApi';

interface UseSlackMappingState {
  isOpen: boolean;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  suggestions: MatchSuggestion[];
  mappingStates: Map<string, EmployeeMappingState>;
  updateProgress: {
    current: number;
    total: number;
  };
  completedCount: number;
}

interface UseSlackMappingActions {
  openModal: () => void;
  closeModal: () => void;
  generateSuggestions: (employees: Employee[]) => Promise<void>;
  updateMappingState: (employeeId: string, state: EmployeeMappingState) => void;
  executeMappings: () => Promise<void>;
  reset: () => void;
}

export function useSlackMapping(): UseSlackMappingState & UseSlackMappingActions {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [mappingStates, setMappingStates] = useState<Map<string, EmployeeMappingState>>(new Map());
  const [updateProgress, setUpdateProgress] = useState({ current: 0, total: 0 });
  const [completedCount, setCompletedCount] = useState(0);

  /**
   * Open the mapping modal
   */
  const openModal = useCallback(() => {
    setIsOpen(true);
    setError(null);
    setCompletedCount(0);
  }, []);

  /**
   * Close the mapping modal and reset state
   */
  const closeModal = useCallback(() => {
    setIsOpen(false);
    // Don't reset immediately to allow showing completion state
    setTimeout(() => {
      reset();
    }, 300);
  }, []);

  /**
   * Generate match suggestions for employees without Slack IDs
   */
  const generateSuggestions = useCallback(async (employees: Employee[]) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch Slack users
      const slackData = await fetchSlackUsers();
      const activeSlackUsers = filterActiveSlackUsers(slackData.users);

      // Generate match suggestions
      const matchSuggestions = findBestMatches(employees, activeSlackUsers);

      setSuggestions(matchSuggestions);

      // Initialize mapping states with default values
      const initialStates = new Map<string, EmployeeMappingState>();
      matchSuggestions.forEach(suggestion => {
        initialStates.set(suggestion.employee.id, {
          employeeId: suggestion.employee.id,
          selectedSlackUser: suggestion.suggestedSlackUser,
          action: suggestion.suggestedSlackUser ? 'APPROVE' : 'SKIP',
        });
      });
      setMappingStates(initialStates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate suggestions';
      setError(errorMessage);
      console.error('Error generating suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update mapping state for a specific employee
   */
  const updateMappingState = useCallback((employeeId: string, state: EmployeeMappingState) => {
    setMappingStates(prev => {
      const newMap = new Map(prev);
      newMap.set(employeeId, state);
      return newMap;
    });
  }, []);

  /**
   * Execute approved mappings by updating employee records
   */
  const executeMappings = useCallback(async () => {
    setIsUpdating(true);
    setError(null);

    // Filter employees that need to be updated (not skipped)
    const employeesToUpdate = Array.from(mappingStates.values()).filter(
      state => state.action !== 'SKIP' && state.selectedSlackUser !== null
    );

    setUpdateProgress({ current: 0, total: employeesToUpdate.length });

    let successCount = 0;
    let failureCount = 0;

    try {
      // Process updates one by one to show progress
      for (let i = 0; i < employeesToUpdate.length; i++) {
        const state = employeesToUpdate[i];
        const employee = suggestions.find(s => s.employee.id === state.employeeId)!.employee;

        try {
          await updateEmployee(state.employeeId, {
            // Preserve all existing fields
            name: employee.name,
            googleId: employee.googleId || undefined,
            dateOfJoining: employee.dateOfJoining,
            region: employee.region,
            active: employee.active,
            carryForwardLeaves: employee.carryForwardLeaves,

            // Update only Slack-related fields
            slackId: state.selectedSlackUser!.slackId,
            slackDisplayName: state.selectedSlackUser!.displayName,
          });

          successCount++;
        } catch (err) {
          failureCount++;
          console.error(`Failed to update employee ${state.employeeId}:`, err);
        }

        setUpdateProgress({ current: i + 1, total: employeesToUpdate.length });
      }

      setCompletedCount(successCount);

      if (failureCount > 0) {
        setError(`Completed with ${successCount} successes and ${failureCount} failures`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update employees';
      setError(errorMessage);
      console.error('Error executing mappings:', err);
    } finally {
      setIsUpdating(false);
    }
  }, [mappingStates, suggestions]);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setIsOpen(false);
    setIsLoading(false);
    setIsUpdating(false);
    setError(null);
    setSuggestions([]);
    setMappingStates(new Map());
    setUpdateProgress({ current: 0, total: 0 });
    setCompletedCount(0);
  }, []);

  return {
    // State
    isOpen,
    isLoading,
    isUpdating,
    error,
    suggestions,
    mappingStates,
    updateProgress,
    completedCount,

    // Actions
    openModal,
    closeModal,
    generateSuggestions,
    updateMappingState,
    executeMappings,
    reset,
  };
}
