import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Wraps a page element. If adminOnly is true, non-admins are redirected home.
 * Usage: <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) return null; // TODO (Phase 6): swap for a proper loading spinner

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;

  return children;
}
