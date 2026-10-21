'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="text-center py-6">
        <div className="text-5xl mb-3">⚠️</div>
        <h2 className="text-xl font-bold text-white mb-2">Enlace de recuperación inválido</h2>
        <p className="text-sm text-slate-400 mb-6">
          No se encontró el token de seguridad en la dirección web.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all"
        >
          Volver al Inicio
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'No se pudo actualizar la contraseña.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch {
      setError('Error al comunicar con el servidor.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6">
        <div className="text-5xl mb-3">✅</div>
        <h2 className="text-xl font-bold text-white mb-2">¡Contraseña Actualizada!</h2>
        <p className="text-sm text-slate-300 mb-6">
          Tu nueva clave de acceso ha sido guardada en la base de datos de Capsule Corp.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/20"
        >
          Ir a Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
          Nueva Contraseña
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
          Confirmar Contraseña
        </label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repite tu contraseña"
          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 mt-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
      >
        {loading ? 'Guardando nueva contraseña...' : 'Actualizar Contraseña'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0F172A] border border-cyan-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-2xl mb-3">
            🔐
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Recuperar Contraseña
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Capsule Corp Cloud Security • Restablecimiento de Credenciales
          </p>
        </div>

        <Suspense
          fallback={
            <div className="text-center py-8 text-slate-400 text-sm animate-pulse">
              Cargando verificador de seguridad...
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          >
            ← Volver a la Tienda Capsule Corp
          </Link>
        </div>
      </div>
    </div>
  );
}
