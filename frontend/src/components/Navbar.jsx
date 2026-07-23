import { Link } from 'react-router-dom';
// TODO (Phase 6): wire up useAuth() (show user name / logout) and useTheme() (dark mode toggle).
export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
      <Link to="/" className="font-bold text-lg">
        🚗 Car Dealership
      </Link>
      <div className="flex gap-4 text-sm">
        <Link to="/purchases">Purchases</Link>
        <Link to="/admin">Admin</Link>
        <Link to="/login">Login</Link>
      </div>
    </nav>
  );
}
