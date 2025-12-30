/**
 * ActiveStatusBadge Component
 * Displays employee active/inactive status with color coding
 */

interface ActiveStatusBadgeProps {
  active: boolean;
}

export function ActiveStatusBadge({ active }: ActiveStatusBadgeProps) {
  const badgeClasses = active
    ? 'px-3 py-1 text-xs font-medium rounded-full border bg-success-100 text-success-700 border-success-200'
    : 'px-3 py-1 text-xs font-medium rounded-full border bg-error-100 text-error-700 border-error-200';

  return <span className={badgeClasses}>{active ? 'Active' : 'Inactive'}</span>;
}
