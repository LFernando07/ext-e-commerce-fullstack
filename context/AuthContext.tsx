'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { NenisUser } from '@/lib/auth/users';
import { trackUserLogin, trackUserLogout } from '@/lib/analytics';
import { api, ENDPOINTS } from '@/lib/api-client';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  businessName?: string;
  businessCategory?: string;
}

interface AuthContextType {
  user: Omit<NenisUser, 'password'> | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string; devResetUrl?: string }>;
  logout: () => Promise<void>;
}

// Contexto de autenticación para manejar el estado del usuario y la sesión
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  forgotPassword: async () => ({ success: false }),
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

  const register = async (payload: RegisterPayload) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Error al registrar la cuenta' };
      }

      setUser(data.user);
      trackUserLogin(data.user);

      return { success: true };
    } catch {
      return { success: false, error: 'Error al conectar con el servidor de registro.' };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Error al procesar la solicitud' };
      }

      return {
        success: true,
        message: data.message,
        devResetUrl: data.devResetUrl,
      };
    } catch {
      return { success: false, error: 'Error al contactar con el servicio de correo.' };
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
    <AuthContext.Provider value={{ user, loading, login, register, forgotPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para acceder al contexto de autenticación
export function useAuth() {
  return useContext(AuthContext);
}
