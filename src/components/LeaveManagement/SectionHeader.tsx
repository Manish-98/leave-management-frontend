import { Button } from '../common/Button';

interface SectionHeaderProps {
  title: string;
  pendingCount?: number;
  onBulkUpload?: () => void;
}

export function SectionHeader({ title, pendingCount = 0, onBulkUpload }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {pendingCount > 0 && (
          <span className="px-3 py-1 text-sm font-medium bg-warning-100 text-warning-800 rounded-full border border-warning-200">
            {pendingCount} pending
          </span>
        )}
      </div>

      {onBulkUpload && (
        <Button
          variant="primary"
          size="md"
          onClick={onBulkUpload}
          className="flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          Bulk Upload
        </Button>
      )}
    </div>
  );
}
