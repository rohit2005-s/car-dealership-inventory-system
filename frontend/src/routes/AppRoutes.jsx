import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import VehicleDetails from '../pages/VehicleDetails';
import AdminDashboard from '../pages/AdminDashboard';
import PurchaseHistory from '../pages/PurchaseHistory';
import NotFound from '../pages/NotFound';
import ProtectedRoute from './ProtectedRoute';

// TODO (Phase 6): import this into App.jsx once AuthProvider/ThemeProvider are wired up.
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Dashboard />} />
      <Route path="/vehicles/:id" element={<VehicleDetails />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchases"
        element={
          <ProtectedRoute>
            <PurchaseHistory />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
