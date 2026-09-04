import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Inverse of ProtectedRoute: if the user is already authenticated, sends
 * them to the dashboard instead of letting them land on /login or /register.
 * Same client-side-only caveat applies — this is a UX nicety, not a security
 * boundary (there's nothing to "protect" here anyway).
 */
export default function GuestOnlyRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}