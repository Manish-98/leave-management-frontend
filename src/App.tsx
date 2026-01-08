import { LeaveManagement } from './components/LeaveManagement';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  return (
    <ToastProvider>
      <LeaveManagement />
    </ToastProvider>
  );
}

export default App;
