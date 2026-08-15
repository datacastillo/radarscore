import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RadarScore | Comunidad de Tipsters Verificados & IA",
  description: "Pronósticos deportivos con IA, verificación automática de tickets y ranking en tiempo real.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark overflow-x-hidden`}
    >
      <body className="min-h-full flex flex-col bg-[#0B0E14] text-white selection:bg-emerald-500 selection:text-black font-sans overflow-x-hidden max-w-full w-full">
        
        {/* Navbar Global (Header Superior + Bottom Bar Móvil) */}
        <Navbar />

        {/* Contenido Dinámico con espacio para Bottom Nav en Celulares */}
        <main className="flex-1 w-full relative pb-16 md:pb-0 overflow-x-hidden">
          {children}
        </main>

      </body>
    </html>
  );
}