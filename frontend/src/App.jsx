import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';

// Providers + routing wired now; each page's real content arrives in Phase 6.
export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Navbar />
        <AppRoutes />
      </ThemeProvider>
    </AuthProvider>
  );
}
