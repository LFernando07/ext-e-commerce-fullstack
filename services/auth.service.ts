/**
 * @file services/auth.service.ts
 * @description Servicio de autenticación para gestión de sesiones, credenciales y recuperación.
 * @layer Service (API -> Service -> Component)
 */

import { api, ENDPOINTS } from '@/lib/api-client';
import { RegisterPayload } from '@/types/general';
import { NenisUser } from '@/lib/auth/users';

export interface LoginResponse {
  success: boolean;
  user?: Omit<NenisUser, 'password'>;
  error?: string;
}

export interface RegisterResponse {
  success: boolean;
  user?: Omit<NenisUser, 'password'>;
  error?: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
  devResetUrl?: string;
  error?: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface SessionResponse {
  authenticated: boolean;
  user: Omit<NenisUser, 'password'> | null;
}

export const authService = {
  /**
   * Obtiene los datos del usuario autenticado actualmente en la sesión de cookies
   */
  async getMe(): Promise<SessionResponse> {
    return api.get(ENDPOINTS.AUTH_ME);
  },

  /**
   * Inicia sesión con credenciales
   */
  async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
    return api.post(ENDPOINTS.AUTH_LOGIN, credentials);
  },

  /**
   * Registra un nuevo usuario en la plataforma
   */
  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    return api.post(ENDPOINTS.AUTH_REGISTER, payload);
  },

  /**
   * Solicita el correo de recuperación de contraseña
   */
  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    return api.post(ENDPOINTS.AUTH_FORGOT_PASSWORD, { email });
  },

  /**
   * Restablece la contraseña utilizando el token enviado por correo
   */
  async resetPassword(payload: { token: string; password: string }): Promise<ResetPasswordResponse> {
    return api.post(ENDPOINTS.AUTH_RESET_PASSWORD, payload);
  },

  /**
   * Cierra la sesión activa en el servidor eliminando cookies de sesión
   */
  async logout(): Promise<{ success: boolean }> {
    return api.post(ENDPOINTS.AUTH_LOGOUT, undefined);
  },
};
