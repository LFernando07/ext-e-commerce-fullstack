"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CacheControls() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string | null>(null);

  const handleRevalidate = async (
    action: "revalidateTag" | "revalidatePath",
    target: string,
  ) => {
    try {
      setLoading(true);
      setLog(null);

      const res = await fetch("/api/cache/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, target }),
      });

      const data = await res.json();

      if (data.success) {
        setLog(`✅ [${data.layer}]: ${data.message}`);
        // Refrescar la vista actual para observar los nuevos datos o el nuevo HTML
        router.refresh();
      } else {
        setLog(`❌ Error: ${data.error}`);
      }
    } catch (err: unknown) {
      setLog(`❌ Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white border border-[#E2DFF5] shadow-sm space-y-4 font-ui">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base text-[#1A1228] flex items-center gap-2">
          <span>🎮</span> Panel de Control y Pruebas en Vivo
        </h3>
        {loading && (
          <span className="text-xs text-[#5B3289] font-medium flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#5B3289]" />
            Revalidando...
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Botón 1: Data Cache */}
        <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#E2DFF5] flex flex-col justify-between space-y-3">
          <div>
            <span className="text-xs font-semibold text-[#5B3289] block">
              1. Purgar Data Cache
            </span>
            <p className="text-[11px] text-[#5E5C78] mt-1 leading-relaxed">
              Invalida solo la respuesta del <code>fetch()</code> etiquetada con{" "}
              <code>tag: {"tasas-nenis"}</code>.
            </p>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleRevalidate("revalidateTag", "tasas-nenis")}
            className="w-full py-2.5 px-4 rounded-full bg-[#5B3289] hover:bg-[#302768] text-white text-xs font-medium transition-all shadow-sm active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {"revalidateTag('tasas-nenis')"}
          </button>
        </div>

        {/* Botón 2: Full Route Cache */}
        <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#E2DFF5] flex flex-col justify-between space-y-3">
          <div>
            <span className="text-xs font-semibold text-[#DD4591] block">
              2. Purgar Full Route Cache
            </span>
            <p className="text-[11px] text-[#5E5C78] mt-1 leading-relaxed">
              Invalida el HTML y RSC Payload estático pre-renderizado de toda la
              página <code>/cache-demo</code>.
            </p>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleRevalidate("revalidatePath", "/cache-demo")}
            className="w-full py-2.5 px-4 rounded-full bg-[#DD4591] hover:bg-[#B2116C] text-white text-xs font-medium transition-all shadow-sm active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {"revalidatePath('/cache-demo')"}
          </button>
        </div>
      </div>

      {log && (
        <div className="p-3.5 rounded-xl bg-[#FAF9FF] border border-[#E2DFF5] text-xs font-mono text-[#1A1228] animate-in fade-in">
          {log}
        </div>
      )}
    </div>
  );
}
