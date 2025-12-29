import type { LeaveFilters } from '../../types/leave';

interface FilterBarProps {
  filters: LeaveFilters;
  onFilterChange: (filters: Partial<LeaveFilters>) => void;
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex flex-wrap gap-4 items-end">
        {/* Search by Employee Name */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Employee
          </label>
          <input
            type="text"
            placeholder="Search by name..."
            value={filters.userId || ''}
            onChange={(e) => onFilterChange({ userId: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Year Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <select
            value={filters.year || 'All'}
            onChange={(e) =>
              onFilterChange({
                year: e.target.value === 'All' ? undefined : Number(e.target.value),
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="All">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Quarter Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quarter
          </label>
          <select
            value={filters.quarter || 'All'}
            onChange={(e) =>
              onFilterChange({
                quarter: e.target.value === 'All' ? undefined : (e.target.value as 'Q1' | 'Q2' | 'Q3' | 'Q4'),
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="All">All Quarters</option>
            <option value="Q1">Q1</option>
            <option value="Q2">Q2</option>
            <option value="Q3">Q3</option>
            <option value="Q4">Q4</option>
          </select>
        </div>
      </div>
    </div>
  );
}
