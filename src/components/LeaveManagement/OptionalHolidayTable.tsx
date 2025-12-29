import type { OptionalHoliday } from '../../types/optionalHoliday';
import { formatDateLong } from '../../utils/formatters';

interface OptionalHolidayTableProps {
  holidays: OptionalHoliday[];
  loading: boolean;
  error: string | null;
  onEdit: (holiday: OptionalHoliday) => void;
  onDelete: (holiday: OptionalHoliday) => void;
}

export function OptionalHolidayTable({
  holidays,
  loading,
  error,
  onEdit,
  onDelete,
}: OptionalHolidayTableProps) {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center justify-center py-12">
          <div className="text-error-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (holidays.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">No optional holidays found. Click "Add Holiday" to create one.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {holidays.map((holiday) => (
              <tr key={holiday.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                  {formatDateLong(holiday.date)}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                  {holiday.name}
                </td>
                <td className="px-6 py-2 text-sm text-gray-600 max-w-md truncate">
                  {holiday.description || '-'}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(holiday)}
                    className="text-primary-600 hover:text-primary-900 mr-4"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(holiday)}
                    className="text-error-600 hover:text-error-900"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
