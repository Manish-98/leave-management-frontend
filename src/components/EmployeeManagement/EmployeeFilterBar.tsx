/**
 * EmployeeFilterBar Component
 * Provides filtering controls for employee list
 */

import type { EmployeeFilters } from '../../types/employee';

interface EmployeeFilterBarProps {
  filters: EmployeeFilters;
  onFilterChange: (filters: Partial<EmployeeFilters>) => void;
}

export function EmployeeFilterBar({ filters, onFilterChange }: EmployeeFilterBarProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ name: e.target.value || undefined });
  };

  const handleActiveChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'all') {
      onFilterChange({ active: undefined });
    } else if (value === 'active') {
      onFilterChange({ active: true });
    } else if (value === 'inactive') {
      onFilterChange({ active: false });
    }
  };

  const handleReset = () => {
    onFilterChange({ name: undefined, active: undefined });
  };

  const hasActiveFilters = filters.name || filters.active !== undefined;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex flex-wrap gap-4 items-end">
        {/* Search by name */}
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="name-search" className="block text-sm font-medium text-gray-700 mb-1">
            Search by Name
          </label>
          <input
            id="name-search"
            type="text"
            placeholder="Enter employee name..."
            value={filters.name || ''}
            onChange={handleNameChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Active status filter */}
        <div className="min-w-[150px]">
          <label htmlFor="active-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="active-filter"
            value={filters.active === undefined ? 'all' : filters.active ? 'active' : 'inactive'}
            onChange={handleActiveChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
