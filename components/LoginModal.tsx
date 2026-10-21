'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
}

export default function LoginModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}: LoginModalProps) {
  const { login, register, forgotPassword } = useAuth();
  const router = useRouter();

  // Modo actual: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);

  // Estados de formularios
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
  });
  const [forgotEmail, setForgotEmail] = useState('');

  // Estados de feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [devResetLink, setDevResetLink] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetFeedback = () => {
    setError(null);
    setSuccessMessage(null);
    setDevResetLink(null);
  };

  const handleSwitchMode = (newMode: 'login' | 'register' | 'forgot') => {
    resetFeedback();
    setMode(newMode);
  };

  // Manejador de Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    resetFeedback();

    const res = await login(loginForm.email, loginForm.password);

    if (res.success) {
      setLoading(false);
      onClose();
      if (onSuccess) onSuccess();
      router.push('/dashboard');
    } else {
      setError(res.error || 'Algo salió mal, verifica tus credenciales.');
      setLoading(false);
    }
  };

  // Manejador de Registro
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    resetFeedback();

    const res = await register({
      name: registerForm.name,
      email: registerForm.email,
      password: registerForm.password,
      businessName: registerForm.businessName || 'Capsule Corp Explorer',
    });

    if (res.success) {
      setLoading(false);
      setSuccessMessage('¡Cuenta creada con éxito! Se ha enviado un correo de bienvenida.');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
        router.push('/dashboard');
      }, 1500);
    } else {
      setError(res.error || 'No se pudo crear la cuenta.');
      setLoading(false);
    }
  };

  // Manejador de Recuperación de Contraseña
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    resetFeedback();

    const res = await forgotPassword(forgotEmail);

    if (res.success) {
      setLoading(false);
      setSuccessMessage(
        res.message || 'Si el correo está registrado, enviamos el enlace a tu bandeja.'
      );
      if (res.devResetUrl) {
        setDevResetLink(res.devResetUrl);
      }
    } else {
      setError(res.error || 'No se pudo procesar la solicitud.');
      setLoading(false);
    }
  };

  // Rellenar usuarios de prueba (Seeds)
  const handleQuickFill = (userEmail: string) => {
    setLoginForm({ email: userEmail, password: 'password123' });
    resetFeedback();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080B11]/80 backdrop-blur-md animate-in fade-in"
    >
      <div className="bg-[#0F172A] w-full max-w-md rounded-3xl shadow-2xl border border-cyan-500/20 p-6 sm:p-8 relative text-slate-100 overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 text-lg transition-colors"
          aria-label="Cerrar modal"
        >
          ✕
        </button>

        {/* Encabezado según modo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 mb-3 text-2xl shadow-inner">
            {mode === 'login' && '💊'}
            {mode === 'register' && '🚀'}
            {mode === 'forgot' && '🔐'}
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {mode === 'login' && '¡Bienvenido/a a tu Espacio!'}
            {mode === 'register' && 'Crear Cuenta Capsule'}
            {mode === 'forgot' && 'Recuperar Acceso'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' && 'Ingresa tus credenciales para acceder a tus órdenes y créditos.'}
            {mode === 'register' && 'Regístrate para guardar tu carrito y recibir cápsulas exclusivas.'}
            {mode === 'forgot' && 'Te enviaremos un correo con enlace seguro mediante Resend.'}
          </p>
        </div>

        {/* Selector de pestañas: Iniciar Sesión / Registro */}
        {mode !== 'forgot' && (
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 mb-5">
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('register')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Registrarse
            </button>
          </div>
        )}

        {/* Notificaciones de error y éxito */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 font-medium">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-medium">
            {successMessage}
          </div>
        )}

        {devResetLink && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
            <p className="font-bold mb-1">⚡ Modo Dev (Atajo directo de prueba):</p>
            <a
              href={devResetLink}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 underline break-all font-mono text-[11px]"
            >
              {devResetLink}
            </a>
          </div>
        )}

        {/* ─── VISTA 1: INICIAR SESIÓN ─── */}
        {mode === 'login' && (
          <>
            {/* Cuentas de prueba rápidas (Seeds) */}
            <div className="mb-5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-[11px] font-semibold text-cyan-400 mb-2 text-center">
                ⚡ Cuentas demo preconfiguradas:
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                <button
                  type="button"
                  onClick={() => handleQuickFill('ana@nenisclub.mx')}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-200 transition-colors"
                >
                  Ana <span className="text-amber-400 font-bold">(Growth)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('karla@nenisclub.mx')}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-200 transition-colors"
                >
                  Karla <span className="text-purple-400 font-bold">(Trusted)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('sofia@nenisclub.mx')}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-200 transition-colors"
                >
                  Sofía <span className="text-teal-400 font-bold">(Starter)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin@nenisclub.mx')}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/50 hover:bg-cyan-900/50 text-cyan-300 font-bold transition-colors"
                >
                  Valeria 👑 (Admin)
                </button>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="tu-correo@ejemplo.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('forgot')}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-2 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Entrando...' : 'Entrar a mi cuenta'}
              </button>
            </form>
          </>
        )}

        {/* ─── VISTA 2: REGISTRO DE CUENTA ─── */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-300">
              🛠️ <strong>Modo Desarrollo:</strong> Puedes registrarte varias veces con tu mismo correo para probar la bienvenida por Resend sin restricciones de unicidad.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                required
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                placeholder="Ej. Bulma Brief"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                placeholder="tu-correo@resend.dev"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre de Emprendimiento o Tienda (Opcional)
              </label>
              <input
                type="text"
                value={registerForm.businessName}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, businessName: e.target.value })
                }
                placeholder="Ej. Laboratorios Capsule"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Creando cuenta y enviando correo...' : 'Crear Cuenta y Empezar'}
            </button>
          </form>
        )}

        {/* ─── VISTA 3: RECUPERAR CONTRASEÑA ─── */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ingresa tu correo registrado
              </label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="tu-correo@ejemplo.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-white font-extrabold text-sm transition-all shadow-lg shadow-red-500/20 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Enviando enlace...' : 'Enviar Enlace de Recuperación (Resend)'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
              >
                ← Volver a Iniciar Sesión
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
