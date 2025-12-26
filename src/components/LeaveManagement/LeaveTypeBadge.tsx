import { getLeaveTypeBadgeClass } from '../../utils/formatters';

interface LeaveTypeBadgeProps {
  leaveType: string;
}

export function LeaveTypeBadge({ leaveType }: LeaveTypeBadgeProps) {
  const badgeClass = getLeaveTypeBadgeClass(leaveType);

  return (
    <span
      className={`px-3 py-1 text-xs font-medium rounded-full border ${badgeClass}`}
    >
      {leaveType}
    </span>
  );
}
