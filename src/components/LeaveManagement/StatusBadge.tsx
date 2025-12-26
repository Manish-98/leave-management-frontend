import { getStatusBadgeClass } from '../../utils/formatters';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const badgeClass = getStatusBadgeClass(status);

  return (
    <span
      className={`px-3 py-1 text-xs font-medium rounded-full border ${badgeClass}`}
    >
      {status}
    </span>
  );
}
