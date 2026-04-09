import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface AuthUser {
  id: number;
  login: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin';
  group_id: number | null;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('edu_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.me().then(data => {
      if (data.user) setUser(data.user);
      else { localStorage.removeItem('edu_token'); }
      setLoading(false);
    }).catch(() => {
      localStorage.removeItem('edu_token');
      setLoading(false);
    });
  }, []);

  const login = async (loginVal: string, password: string): Promise<string | null> => {
    const data = await api.login(loginVal, password);
    if (data.token) {
      localStorage.setItem('edu_token', data.token);
      setUser(data.user);
      return null;
    }
    return data.error || 'Ошибка входа';
  };

  const logout = () => {
    localStorage.removeItem('edu_token');
    setUser(null);
  };

  return { user, loading, login, logout };
}
