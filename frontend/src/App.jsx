import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Layout>
          <AppRoutes />
        </Layout>

        <Toaster position="top-right" />
      </ThemeProvider>
    </AuthProvider>
  );
}