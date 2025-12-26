import { useState } from 'react';
import { useLeaveRequests } from '../../hooks/useLeaveRequests';
import { LeaveStatus } from '../../types/leave';
import type { ViewMode } from '../../types/leave';
import { Header } from './Header';
import { SectionHeader } from './SectionHeader';
import { FilterBar } from './FilterBar';
import { LeaveRequestsTable } from './LeaveRequestsTable';

export function LeaveManagement() {
  const [currentView, setCurrentView] = useState<ViewMode>('admin');

  const {
    leaveRequests,
    loading,
    error,
    currentPage,
    totalPages,
    totalElements,
    filters,
    updateFilters,
    goToPage,
  } = useLeaveRequests();

  // Calculate pending count
  const pendingCount = leaveRequests.filter(
    (req) => req.status === LeaveStatus.PENDING
  ).length;

  const handleApprove = (id: string) => {
    // TODO: Implement approve API call when endpoint is available
    console.log('Approve request:', id);
    alert('Approve functionality will be implemented when API endpoint is available');
  };

  const handleReject = (id: string) => {
    // TODO: Implement reject API call when endpoint is available
    console.log('Reject request:', id);
    alert('Reject functionality will be implemented when API endpoint is available');
  };

  const handleViewSwitch = (view: ViewMode) => {
    setCurrentView(view);
  };

  if (currentView === 'employee') {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Header currentView={currentView} onViewSwitch={handleViewSwitch} />
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-600 text-lg">Employee View coming soon...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <Header currentView={currentView} onViewSwitch={handleViewSwitch} />

        <div className="mb-6">
          <SectionHeader title="Pending Approvals" pendingCount={pendingCount} />
        </div>

        <FilterBar filters={filters} onFilterChange={updateFilters} />

        <LeaveRequestsTable
          leaveRequests={leaveRequests}
          loading={loading}
          error={error}
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={goToPage}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </div>
  );
}
