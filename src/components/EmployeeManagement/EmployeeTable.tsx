/**
 * EmployeeTable Component
 * Displays employee list in table format with actions and pagination
 */

import { ActiveStatusBadge } from './ActiveStatusBadge';
import { Pagination } from '../LeaveManagement/Pagination';
import type { EmployeeDisplay } from '../../types/employee';

interface EmployeeTableProps {
  employees: EmployeeDisplay[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onEdit: (employee: EmployeeDisplay) => void;
  onDeactivate: (employee: EmployeeDisplay) => void;
}

export function EmployeeTable({
  employees,
  loading,
  currentPage,
  totalPages,
  totalElements,
  onPageChange,
  onEdit,
  onDeactivate,
}: EmployeeTableProps) {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-8 text-center text-gray-500">Loading employees...</div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No employees found</h3>
        <p className="text-sm text-gray-500">
          Get started by adding a new employee or adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date of Joining
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Region
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Carry Forward Leaves
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created Date
            </th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {employees.map((employee) => (
            <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-2 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {employee.name}
                  {(employee.slackDisplayName || employee.slackId) && (
                    <span className="text-xs text-gray-500 ml-2">
                      (@{employee.slackDisplayName || employee.slackId})
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                {employee.dateOfJoiningDisplay}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                {employee.region}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                <ActiveStatusBadge active={employee.active} />
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                {employee.carryForwardLeavesDisplay}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                {employee.createdAtDisplay}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(employee)}
                  className="text-primary-600 hover:text-primary-900 mr-4 transition-colors"
                  title="Edit employee"
                >
                  <svg
                    className="w-5 h-5 inline"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                {employee.active && (
                  <button
                    onClick={() => onDeactivate(employee)}
                    className="text-error-600 hover:text-error-900 transition-colors"
                    title="Deactivate employee"
                  >
                    <svg
                      className="w-5 h-5 inline"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                      />
                    </svg>
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={onPageChange}
      />
    </div>
  );
}
