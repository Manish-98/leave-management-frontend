import { Button } from '../common/Button';
import { PAGE_SIZE } from '../../hooks/useLeaveRequests';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalElements,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages: number[] = [];
  const maxVisiblePages = 5;

  // Calculate which page numbers to show
  let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(0, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
      {/* Info */}
      <div className="text-sm text-gray-700">
        Showing <span className="font-medium">{currentPage * PAGE_SIZE + 1}</span> to{' '}
        <span className="font-medium">{Math.min((currentPage + 1) * PAGE_SIZE, totalElements)}</span> of{' '}
        <span className="font-medium">{totalElements}</span> results
      </div>

      {/* Page Navigation */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </Button>

        {pages.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onPageChange(page)}
          >
            {page + 1}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
