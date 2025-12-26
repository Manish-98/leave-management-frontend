import type { LeaveRequestDisplay } from '../../types/leave';
import { formatDateShort, formatDateTime } from '../../utils/formatters';
import { StatusBadge } from './StatusBadge';
import { LeaveTypeBadge } from './LeaveTypeBadge';
import { ActionButtons } from './ActionButtons';

interface TableRowProps {
  request: LeaveRequestDisplay;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function TableRow({ request, onApprove, onReject }: TableRowProps) {
  const handleApprove = () => {
    if (onApprove) {
      onApprove(request.id);
    }
  };

  const handleReject = () => {
    if (onReject) {
      onReject(request.id);
    }
  };

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      {/* Employee */}
      <td className="px-6 py-2">
        <div className="text-sm font-medium text-gray-900">{request.userId}</div>
      </td>

      {/* Type */}
      <td className="px-6 py-2">
        <LeaveTypeBadge leaveType={request.leaveTypeDisplay} />
      </td>

      {/* Start Date */}
      <td className="px-6 py-2 whitespace-nowrap">
        <div className="text-sm text-gray-700">{formatDateShort(request.startDate)}</div>
      </td>

      {/* End Date */}
      <td className="px-6 py-2 whitespace-nowrap">
        <div className="text-sm text-gray-700">{formatDateShort(request.endDate)}</div>
      </td>

      {/* Days */}
      <td className="px-6 py-2 whitespace-nowrap">
        <div className="text-sm text-gray-700">{request.durationInDays}</div>
      </td>

      {/* Status */}
      <td className="px-6 py-2">
        <StatusBadge status={request.statusDisplay} />
      </td>

      {/* Submitted */}
      <td className="px-6 py-2 whitespace-nowrap">
        <div className="text-sm text-gray-700">
          {formatDateTime(request.startDate)}
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-2">
        <ActionButtons
          status={request.statusDisplay}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </td>
    </tr>
  );
}
