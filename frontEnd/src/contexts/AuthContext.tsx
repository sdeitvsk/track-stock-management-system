import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/authService';

interface User {
  id: number;
  username: string;
  member_id: number | null;
  role: 'admin' | 'staff';
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  member?: {
    id: number;
    name: string;
    type: string;
    department: string | null;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, role?: 'admin' | 'staff') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const ensureUserShape = (user: any): User => ({
    id: user.id,
    username: user.username,
    member_id: user.member_id ?? null,
    role: user.role,
    is_active: user.is_active,
    last_login: user.last_login ?? null,
    created_at: user.created_at,
    member: user.member ? {
      id: user.member.id,
      name: user.member.name,
      type: user.member.type,
      department: user.member.department ?? null,
    } : undefined,
  });

  useEffect(() => {
    const initAuth = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser && authService.isAuthenticated()) {
        try {
          const response = await authService.getProfile();
          setUser(ensureUserShape(response.data.user));
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          authService.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login({ username, password });
      setUser(ensureUserShape(response.data.user));
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, password: string, role: 'admin' | 'staff' = 'staff') => {
    try {
      const response = await authService.register({ username, password, role });
      setUser(ensureUserShape(response.data.user));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
