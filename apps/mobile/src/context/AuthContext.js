import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, tokenStore } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await tokenStore.get();
      if (!token) {
        setCargando(false);
        return;
      }
      try {
        const res = await api.me();
        setUser(res.data.user);
      } catch {
        await tokenStore.clear();
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.login(email, password);
    await tokenStore.set(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    await tokenStore.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
