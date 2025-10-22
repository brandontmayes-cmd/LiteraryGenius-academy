import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function DashboardRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Redirect to appropriate dashboard based on role
  switch (user.role) {
    case 'student':
      return <Navigate to="/student-dashboard" replace />;
    case 'teacher':
      return <Navigate to="/teacher-dashboard" replace />;
    case 'parent':
      return <Navigate to="/parent-dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
}
