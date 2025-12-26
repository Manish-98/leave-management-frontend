import { Button } from '../common/Button';

interface ActionButtonsProps {
  status: string;
  onApprove?: () => void;
  onReject?: () => void;
}

export function ActionButtons({ status, onApprove, onReject }: ActionButtonsProps) {
  const isPending = status === 'Pending';

  if (!isPending) {
    return <span className="text-gray-400 text-sm">-</span>;
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="success"
        size="sm"
        onClick={onApprove}
        className="!bg-white !text-success-600 !border-success-400 hover:!bg-success-50"
      >
        Approve
      </Button>
      <Button
        variant="danger"
        size="sm"
        onClick={onReject}
        className="!bg-white !text-error-600 !border-error-400 hover:!bg-error-50"
      >
        Reject
      </Button>
    </div>
  );
}
