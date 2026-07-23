import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

/**
 * Holds current user + token in memory, synced with localStorage.
 * TODO (Phase 6): populate login()/register()/logout() with real
 * calls to authService, and expose `isAdmin` helper for route guards.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (_credentials) => {
    // TODO (Phase 6): call authService.login, then setUser + persist token
  };

  const register = async (_details) => {
    // TODO (Phase 6): call authService.register, then setUser + persist token
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
