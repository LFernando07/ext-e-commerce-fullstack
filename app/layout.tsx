import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import AnalyticsRouteTracker from "@/components/AnalyticsRouteTracker";
import Link from "next/link";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import ConsentPreferencesButton from "@/components/ConsentPreferencesButton";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/dbz/CartDrawer";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "Nenis Club — Haz crecer tu negocio entre nenis",
    template: "%s | Nenis Club",
  },
  description: "Plataforma de financiamiento y plazos diseñada especialmente para mujeres emprendedoras en México.",
  keywords: ['Nenis Club', 'Nenis Plazos', 'Emprendedoras', 'Crédito para mujeres', 'México'],
  authors: [{ name: 'Nenis Club' }],
  creator: 'Nenis Club',

  openGraph: {
    title: "Nenis Club — Haz crecer tu negocio entre nenis",
    description: "Plataforma de financiamiento y plazos diseñada especialmente para mujeres emprendedoras en México.",
    url: "http://localhost:3000",
    siteName: "Nenis Club",
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: "summary_large_image",
    title: "Nenis Club — Haz crecer tu negocio entre nenis",
    description: "Plataforma de financiamiento y plazos diseñada especialmente para mujeres emprendedoras en México.",
  },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF9FF] text-[#1A1228] font-body" suppressHydrationWarning>
        {/* 1. Google Consent Mode v2 (Inicialización de consentimiento por defecto) */}
        <Script id="google-consent-mode-init" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}

            let savedConsent = null;
            try {
              savedConsent = JSON.parse(localStorage.getItem('user_cookie_consent_v1'));
            } catch (e) {}

            gtag('consent', 'default', {
              'analytics_storage': savedConsent ? (savedConsent.analytics ? 'granted' : 'denied') : 'denied',
              'ad_storage': savedConsent ? (savedConsent.marketing ? 'granted' : 'denied') : 'denied',
              'ad_user_data': savedConsent ? (savedConsent.marketing ? 'granted' : 'denied') : 'denied',
              'ad_personalization': savedConsent ? (savedConsent.marketing ? 'granted' : 'denied') : 'denied',
              'wait_for_update': 500
            });
          `}
        </Script>

        {/* 2. Google Analytics 4 (gtag.js) */}
        {GA_ID && (
          <>
            <Script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}></Script>
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </> 
        )}

        {/* 3. Meta Pixel (Facebook Pixel) con soporte de consentimiento */}
        {PIXEL_ID && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              
              // Si no ha dado consentimiento de marketing, revocar por defecto
              try {
                var c = JSON.parse(localStorage.getItem('user_cookie_consent_v1'));
                if (!c || !c.marketing) {
                  fbq('consent', 'revoke');
                }
              } catch(e) {
                fbq('consent', 'revoke');
              }

              fbq('init', '${PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}

        <AnalyticsRouteTracker />

        <AuthProvider>
          <CartProvider>
            {/* Header con Navbar fija y estado de sesión */}
            <Navbar />

            {/* Contenido dinámico principal */}
            <div className="flex-1 flex flex-col min-w-min">
              {children}
            </div>

            {/* Drawer lateral interactivo de compras (useActionState + useOptimistic) */}
            <CartDrawer />

            {/* Footer Corporativo */}
            <footer className="bg-[#0F131D] text-white border-t border-cyan-500/20 py-12 px-4 sm:px-6 mt-auto">
              <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col items-center md:items-start gap-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-xs">
                      CC
                    </span>
                    <span className="font-display font-bold text-lg text-white">Capsule Corp Store</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    E-Commerce de guerreros Z y tecnología Hoi-Poi sobre Next.js 16.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-gray-400">
                  <Link href="/" className="hover:text-cyan-400 transition-colors">
                    Tienda
                  </Link>
                  <Link href="/cache-demo" className="hover:text-cyan-400 transition-colors">
                    Lab de Caché
                  </Link>
                  <Link href="/about" className="hover:text-cyan-400 transition-colors">
                    Sobre Nosotros
                  </Link>
                  <Link href="/cookies" className="hover:text-cyan-400 transition-colors">
                    Política de Cookies
                  </Link>
                  <ConsentPreferencesButton />
                </div>
              </div>

              <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/10 text-center text-[11px] text-gray-500 font-mono">
                © Capsule Corp & Nenis Club. Demostración técnica integral de Next.js (PPR, Server Actions, useOptimistic, Data Cache).
              </div>
            </footer>
          </CartProvider>
        </AuthProvider>

        {/* 4. Banner interactivo y modal de Cookies */}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
