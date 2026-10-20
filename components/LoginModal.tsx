'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const { login } = useAuth();
  const router = useRouter();
  // Estado general del formulario de login
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(loginForm.email, loginForm.password);

    if (res.success) {
      setLoading(false);
      onClose();
      if (onSuccess) onSuccess();
      router.push('/dashboard');
    } else {
      setError(res.error || 'Algo salió mal, verifica tus datos.');
      setLoading(false);
    }
  };

  // Rellenar usuarios de prueba
  const handleQuickFill = (userEmail: string) => {
    setLoginForm({...loginForm, email: userEmail, password: 'password123'});
    setError(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1228]/60 backdrop-blur-sm animate-in fade-in"
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#E2DFF5] p-6 sm:p-8 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 text-lg"
          aria-label="Cerrar modal"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FAF9FF] border border-[#E2DFF5] mb-3 text-2xl">
            🌸
          </div>
          <h2 className="text-2xl font-bold font-display text-[#1A1228]">
            ¡Bienvenida a tu espacio!
          </h2>
          <p className="text-sm font-body text-[#5E5C78] mt-1">
            Ingresa para consultar tus plazos, nivel y crédito disponible.
          </p>
        </div>

        {/* Cuentas de prueba rápidas (Seeds) */}
        <div className="mb-5 p-3 rounded-xl bg-[#FAF9FF] border border-[#E2DFF5]">
          <p className="text-xs font-semibold text-[#5B3289] font-ui mb-2 text-center">
            ⚡ Cuentas demo de prueba (clic para rellenar):
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            <button
              type="button"
              onClick={() => handleQuickFill('ana@nenisclub.mx')}
              className="text-xs px-2.5 py-1 rounded-full bg-white border border-[#E2DFF5] hover:border-[#5B3289] text-[#1A1228] transition-colors"
            >
              Ana <span className="text-[#F7A914] font-bold">(Growth)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('karla@nenisclub.mx')}
              className="text-xs px-2.5 py-1 rounded-full bg-white border border-[#E2DFF5] hover:border-[#5B3289] text-[#1A1228] transition-colors"
            >
              Karla <span className="text-[#5B3289] font-bold">(Trusted)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('sofia@nenisclub.mx')}
              className="text-xs px-2.5 py-1 rounded-full bg-white border border-[#E2DFF5] hover:border-[#5B3289] text-[#1A1228] transition-colors"
            >
              Sofía <span className="text-[#51BDC6] font-bold">(Starter)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@nenisclub.mx')}
              className="text-xs px-2.5 py-1 rounded-full bg-purple-50 border border-[#5B3289] hover:bg-purple-100 text-[#5B3289] font-bold transition-colors"
            >
              Valeria 👑 (Admin)
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-body">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#1A1228] font-ui mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={loginForm.email}
              onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
              placeholder="tu-correo@ejemplo.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2DFF5] text-sm font-body text-[#1A1228] focus:outline-none focus:border-[#5B3289] focus:ring-2 focus:ring-[#5B3289]/15 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1A1228] font-ui mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2DFF5] text-sm font-body text-[#1A1228] focus:outline-none focus:border-[#5B3289] focus:ring-2 focus:ring-[#5B3289]/15 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-full bg-[#5B3289] hover:bg-[#302768] text-white font-ui font-medium text-sm transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar a mi cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}
