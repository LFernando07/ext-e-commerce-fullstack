"use client";

import React, { createContext, useEffect, useState } from "react";
import { trackUserLogin, trackUserLogout } from "@/lib/analytics";
import { authService } from "@/services/auth.service";
import { AuthContextType, RegisterPayload } from "@/types/general";
import { NenisUser } from "@/lib/auth/users";

// Contexto de autenticación para manejar el estado del usuario y la sesión
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  forgotPassword: async () => ({ success: false }),
  logout: async () => {},
});

// Provider de autenticación que envuelve la aplicación y maneja el estado del usuario
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Omit<NenisUser, "password"> | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario de sesión activa al montar usando authService
  useEffect(() => {
    async function loadSession() {
      try {
        const data = await authService.getMe();
        if (data.authenticated && data.user) {
          setUser(data.user);
          // Sincronizar user_properties si hay sesión activa
          trackUserLogin(data.user);
        }
      } catch (err) {
        console.error("Error cargando sesión:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await authService.login({ email, password });

      if (!data.success || !data.user) {
        return {
          success: false,
          error: data.error || "Credenciales inválidas",
        };
      }

      setUser(data.user);

      // Disparar user_properties a GA4 (solo si aceptó cookies analíticas)
      trackUserLogin(data.user);

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: (err as Error).message || "Error al conectar con el servidor.",
      };
    }
  };

  const register = async (payload: RegisterPayload) => {
    try {
      const data = await authService.register(payload);

      if (!data.success || !data.user) {
        return {
          success: false,
          error: data.error || "Error al registrar la cuenta",
        };
      }

      setUser(data.user);
      trackUserLogin(data.user);

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: (err as Error).message || "Error al conectar con el servidor de registro.",
      };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const data = await authService.forgotPassword(email);

      if (!data.success) {
        return {
          success: false,
          error: data.error || "Error al procesar la solicitud",
        };
      }

      return {
        success: true,
        message: data.message,
        devResetUrl: data.devResetUrl,
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: (err as Error).message || "Error al contactar con el servicio de correo.",
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      trackUserLogout();
      setUser(null);
    } catch (err) {
      console.error("Error cerrando sesión:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, forgotPassword, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
