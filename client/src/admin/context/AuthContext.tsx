import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface AdminInfo {
  id: number;
  email: string;
  name: string;
}

interface AuthCtx {
  token: string | null;
  admin: AdminInfo | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'));
  const [admin, setAdmin] = useState<AdminInfo | null>(null);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Fetch current admin info
      axios.get<AdminInfo>('/api/auth/me').then((r) => setAdmin(r.data)).catch(() => {
        localStorage.removeItem('admin_token');
        setToken(null);
      });
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setAdmin(null);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const { data } = await axios.post<{ token: string; admin: AdminInfo }>('/api/auth/login', { email, password });
    localStorage.setItem('admin_token', data.token);
    setToken(data.token);
    setAdmin(data.admin);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ token, admin, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
