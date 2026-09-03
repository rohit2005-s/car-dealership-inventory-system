import { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';
import { isTokenExpired } from '../utils/jwt';

export const AuthContext = createContext(null);

function readStoredAuth() {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  if (!token || !storedUser) return { user: null, token: null };

  if (isTokenExpired(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { user: null, token: null };
  }

  try {
    return { user: JSON.parse(storedUser), token };
  } catch {
    return { user: null, token: null };
  }
}

function persistAuth(user, token) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearStoredAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

/**
 * Owns client-side auth state for the SPA: current user, JWT, and derived
 * isAuthenticated flag. Persists to localStorage so a page refresh doesn't
 * log the user out, and validates the token's expiry on load.
 *
 * IMPORTANT: this is a client-side convenience layer only. It does not (and
 * cannot) enforce security — every protected/admin-only backend route still
 * re-verifies the JWT and role independently via authMiddleware/roleMiddleware.
 * Client-side role checks here only drive which UI is shown; they are not a
 * substitute for backend authorization.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { user: storedUser, token: storedToken } = readStoredAuth();

    setUser(storedUser);
    setToken(storedToken);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    const { user: loggedInUser, token: issuedToken } = res.data.data;

    persistAuth(loggedInUser, issuedToken);
    setUser(loggedInUser);
    setToken(issuedToken);

    return loggedInUser;
  }, []);

  const register = useCallback(async (details) => {
    const res = await authService.register(details);
    const { user: newUser, token: issuedToken } = res.data.data;

    persistAuth(newUser, issuedToken);
    setUser(newUser);
    setToken(issuedToken);

    return newUser;
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setUser(null);
    setToken(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}