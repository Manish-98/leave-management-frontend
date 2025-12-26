interface SectionHeaderProps {
  title: string;
  pendingCount?: number;
}

export function SectionHeader({ title, pendingCount = 0 }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      {pendingCount > 0 && (
        <span className="px-3 py-1 text-sm font-medium bg-warning-100 text-warning-800 rounded-full border border-warning-200">
          {pendingCount} pending
        </span>
      )}
    </div>
  );
}
