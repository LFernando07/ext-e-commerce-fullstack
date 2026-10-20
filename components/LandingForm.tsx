"use client";

import { trackLeadSubmission } from "@/lib/analytics";
import { api, ENDPOINTS } from "@/lib/api-client";
import { useState } from "react";

export default function LandingForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "");
    const name = formData.get("name")
      ? String(formData.get("name"))
      : undefined;

    try {
      // api.post con endpoint tipado ENDPOINTS.LEADS
      const res = await api.post(ENDPOINTS.LEADS, { email, name });

      if (res.success) {
        trackLeadSubmission("emprendedora_registro");
        setSubmitted(true);
      } else {
        alert("Algo salió mal, por favor intenta de nuevo.");
      }
    } catch (err: unknown) {
      alert(
        `Algo salió mal, por favor intenta de nuevo. Error: ${(err as Error).message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-white border border-[#E2DFF5] shadow-lg text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-[#51BDC6]/15 text-[#00A4BF] text-2xl flex items-center justify-center mx-auto">
          ✓
        </div>
        <h3 className="font-display font-bold text-2xl text-[#1A1228]">
          ¡Bienvenida al club!
        </h3>
        <p className="font-body text-sm text-[#5E5C78]">
          Pronto nos pondremos en contacto contigo para ayudarte a activar tu
          línea de crédito.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-white border border-[#E2DFF5] shadow-lg">
      <div className="text-center mb-6">
        <span className="text-xs font-ui uppercase tracking-wider text-[#5B3289] font-semibold block mb-1">
          Únete a Nenis Club
        </span>
        <h3 className="font-display font-bold text-2xl text-[#1A1228]">
          Haz crecer tu negocio
        </h3>
        <p className="font-body text-sm text-[#5E5C78] mt-1">
          Déjanos tus datos y te avisaremos cuando abramos cupos para nuevas
          nenis.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-ui font-medium text-[#1A1228] mb-1.5">
            ¿Cómo te llamas?
          </label>
          <input
            type="text"
            name="name"
            required
            placeholder="Tu nombre completo o negocio"
            className="w-full px-4 py-3 rounded-xl border border-[#E2DFF5] bg-[#FAF9FF] text-[#1A1228] font-body text-sm focus:outline-none focus:border-[#5B3289] focus:ring-2 focus:ring-[#5B3289]/10 transition-all placeholder:text-[#9E9CB8]"
          />
        </div>

        <div>
          <label className="block text-xs font-ui font-medium text-[#1A1228] mb-1.5">
            Tu correo electrónico
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="ejemplo@correo.com"
            className="w-full px-4 py-3 rounded-xl border border-[#E2DFF5] bg-[#FAF9FF] text-[#1A1228] font-body text-sm focus:outline-none focus:border-[#5B3289] focus:ring-2 focus:ring-[#5B3289]/10 transition-all placeholder:text-[#9E9CB8]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-full bg-[#5B3289] hover:bg-[#302768] text-white font-ui font-medium text-sm transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? "Guardando tus datos..." : "Quiero unirme al club"}
        </button>
      </form>
    </div>
  );
}
