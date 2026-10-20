'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { NenisUser } from '@/lib/auth/users';
import { trackUserLogin, trackUserLogout } from '@/lib/analytics';
import { api, ENDPOINTS } from '@/lib/api-client';

interface AuthContextType {
  user: Omit<NenisUser, 'password'> | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

// Contexto de autenticación para manejar el estado del usuario y la sesión
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
});

// Provider de autenticación que envuelve la aplicación y maneja el estado del usuario
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Omit<NenisUser, 'password'> | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario de sesión activa al montar usando el cliente tipado
  useEffect(() => {
    async function loadSession() {
      try {
        const data = await api.get(ENDPOINTS.AUTH_ME);
        if (data.authenticated && data.user) {
          setUser(data.user);
          // Sincronizar user_properties si hay sesión activa
          trackUserLogin(data.user);
        }
      } catch (err) {
        console.error('Error cargando sesión:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Credenciales inválidas' };
      }

      setUser(data.user);

      // Disparar user_properties a GA4 (solo si aceptó cookies analíticas)
      trackUserLogin(data.user);

      return { success: true };
    } catch {
      return { success: false, error: 'Error al conectar con el servidor.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      trackUserLogout();
      setUser(null);
    } catch (err) {
      console.error('Error cerrando sesión:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para acceder al contexto de autenticación
export function useAuth() {
  return useContext(AuthContext);
}
