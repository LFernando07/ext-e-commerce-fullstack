import type { Metadata } from 'next';
import Link from 'next/link';
import ConsentPreferencesButton from '@/components/ConsentPreferencesButton';

export const metadata: Metadata = {
  title: 'Política de Cookies | Nenis Club',
  description: 'Conoce cómo usamos cookies y protegemos tu privacidad en la plataforma de Nenis Club.',
};

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-[#FAF9FF] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navegación de retorno */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-ui font-medium text-[#5B3289] hover:text-[#302768] transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>

        {/* Tarjeta Principal de la Política */}
        <article className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-[#E2DFF5] space-y-8 text-[#1A1228]">
          
          {/* Encabezado */}
          <header className="border-b border-[#E2DFF5] pb-6">
            <span className="text-xs font-ui uppercase tracking-wider text-[#5B3289] font-semibold block mb-1">
              Transparencia y Privacidad
            </span>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#1A1228]">
              Política de Cookies de Nenis Club
            </h1>
            <p className="text-xs font-ui text-[#5E5C78] mt-2">
              Última actualización: 14 de octubre de 2026
            </p>
          </header>

          {/* Introducción */}
          <section className="space-y-3 font-body text-sm sm:text-base text-[#5E5C78] leading-relaxed">
            <p>
              En <strong className="text-[#1A1228]">Nenis Club</strong> nos tomamos muy en serio la confianza que depositas en nosotras. Esta Política de Cookies explica de manera clara, transparente y sin tecnicismos innecesarios qué son las cookies, qué tecnologías utilizamos en este sitio web y cómo puedes tener control total sobre ellas en todo momento.
            </p>
          </section>

          {/* Sección 1: ¿Qué son las cookies? */}
          <section className="space-y-3">
            <h2 className="font-display font-medium text-2xl text-[#1A1228]">
              1. ¿Qué son las cookies?
            </h2>
            <p className="font-body text-sm sm:text-base text-[#5E5C78] leading-relaxed">
              Las cookies son pequeños archivos de texto que los sitios web colocan en tu computadora, teléfono o tableta cuando navegas por internet. Sirven para recordar tus preferencias de visita (como tu inicio de sesión o si ya viste un mensaje), hacer que la página funcione correctamente y comprender qué herramientas o secciones son más útiles para nuestra comunidad.
            </p>
          </section>

          {/* Sección 2: ¿Qué cookies utilizamos? */}
          <section className="space-y-4">
            <h2 className="font-display font-medium text-2xl text-[#1A1228]">
              2. Categorías de cookies en nuestra plataforma
            </h2>
            <p className="font-body text-sm text-[#5E5C78]">
              Dividimos nuestras cookies en tres categorías para que tú decidas cuáles permites:
            </p>

            <div className="space-y-4 pt-2">
              
              {/* Esenciales */}
              <div className="p-5 rounded-2xl bg-[#FAF9FF] border border-[#E2DFF5]">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <h3 className="font-ui font-semibold text-base text-[#1A1228] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#51BDC6]" />
                    Cookies Esenciales (Técnicas)
                  </h3>
                  <span className="text-[11px] font-ui uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                    Siempre activas
                  </span>
                </div>
                <p className="font-body text-xs sm:text-sm text-[#5E5C78] leading-relaxed">
                  Son indispensables para que la plataforma funcione. Incluyen la cookie segura de autenticación (<code className="bg-white px-1.5 py-0.5 rounded border border-[#E2DFF5] text-[#5B3289] font-mono">nenis_session</code>) que mantiene abierta tu sesión de usuaria y el registro de tu propia elección de privacidad. No almacenan información identificable con fines publicitarios.
                </p>
              </div>

              {/* Analíticas */}
              <div className="p-5 rounded-2xl bg-white border border-[#E2DFF5]">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <h3 className="font-ui font-semibold text-base text-[#1A1228] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#5B3289]" />
                    Cookies de Análisis y Medición (Google Analytics 4)
                  </h3>
                  <span className="text-[11px] font-ui uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-[#5B3289] font-semibold">
                    Opcionales
                  </span>
                </div>
                <p className="font-body text-xs sm:text-sm text-[#5E5C78] leading-relaxed">
                  Nos permiten saber de forma estadística y agregada cuántas personas visitan Nenis Club, cuánto tiempo pasan en cada sección y qué funciones necesitan mejoras. Usamos <strong>Google Consent Mode v2</strong>, lo que garantiza que si las desactivas, Google Analytics bloquea totalmente el almacenamiento y la recolección de métricas.
                </p>
              </div>

              {/* Marketing */}
              <div className="p-5 rounded-2xl bg-white border border-[#E2DFF5]">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <h3 className="font-ui font-semibold text-base text-[#1A1228] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#DD4591]" />
                    Cookies de Publicidad y Redes Sociales (Meta Pixel)
                  </h3>
                  <span className="text-[11px] font-ui uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pink-100 text-[#DD4591] font-semibold">
                    Opcionales
                  </span>
                </div>
                <p className="font-body text-xs sm:text-sm text-[#5E5C78] leading-relaxed">
                  Utilizadas en conjunto con Meta (Facebook e Instagram) para difundir convocatorias de crédito y beneficios a más emprendedoras mexicanas. Solo se activan si otorgas tu consentimiento expreso en nuestro banner.
                </p>
              </div>

            </div>
          </section>

          {/* Sección 3: Cómo gestionar tus preferencias */}
          <section className="space-y-4 p-6 rounded-3xl bg-[#F1EFF9] border border-[#E2DFF5]">
            <h2 className="font-display font-medium text-2xl text-[#1A1228]">
              3. ¿Cómo puedes controlar o cambiar tus preferencias?
            </h2>
            <p className="font-body text-sm text-[#5E5C78] leading-relaxed">
              Tú tienes el control total en todo momento. Puedes cambiar tus decisiones de consentimiento dando clic en el botón de abajo o desde el enlace disponible en el pie de página de todo el sitio web:
            </p>
            <div>
              <ConsentPreferencesButton
                label="Abrir panel de preferencias de cookies"
                className="px-6 py-3 rounded-full bg-[#5B3289] hover:bg-[#302768] text-white font-ui font-medium text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
              />
            </div>
          </section>

          {/* Sección 4: Control desde el navegador */}
          <section className="space-y-3">
            <h2 className="font-display font-medium text-2xl text-[#1A1228]">
              4. Control directo desde tu navegador
            </h2>
            <p className="font-body text-sm sm:text-base text-[#5E5C78] leading-relaxed">
              Adicionalmente, puedes eliminar o bloquear cookies desde la configuración de tu navegador favorito:
            </p>
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-ui">
              <li className="p-3 bg-[#FAF9FF] rounded-xl border border-[#E2DFF5] text-center font-medium">Google Chrome</li>
              <li className="p-3 bg-[#FAF9FF] rounded-xl border border-[#E2DFF5] text-center font-medium">Apple Safari</li>
              <li className="p-3 bg-[#FAF9FF] rounded-xl border border-[#E2DFF5] text-center font-medium">Mozilla Firefox</li>
              <li className="p-3 bg-[#FAF9FF] rounded-xl border border-[#E2DFF5] text-center font-medium">Microsoft Edge</li>
            </ul>
          </section>

          {/* Sección 5: Dudas y contacto */}
          <footer className="pt-6 border-t border-[#E2DFF5] text-xs font-body text-[#5E5C78] space-y-2">
            <p>
              ¿Tienes alguna duda sobre el uso de cookies o el tratamiento de tus datos? Puedes contactarnos a través de nuestro equipo de soporte en <strong className="text-[#1A1228]">contacto@nenisclub.mx</strong>.
            </p>
            <p className="text-[11px] text-[#9E9CB8]">
              Esta política fue desarrollada internamente para Nenis Club con tecnología 100% propia, garantizando cumplimiento con los estándares de privacidad y Google Consent Mode v2 sin intermediarios.
            </p>
          </footer>

        </article>

      </div>
    </main>
  );
}
