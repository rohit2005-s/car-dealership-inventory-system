import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Wraps a page element. If adminOnly is true, non-admins are redirected home.
 * Usage: <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
 *
 * This only controls what renders client-side. The real security boundary
 * is the backend's authMiddleware/roleMiddleware — this component exists so
 * users get a sensible redirect instead of a 401/403 flashing on screen.
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}