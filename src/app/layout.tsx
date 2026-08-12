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
  title: "RadarScore | Comunidad de Tipsters Verificados",
  description: "Pronósticos deportivos, verificación automática de tickets y ranking en tiempo real.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0B0E14] text-white selection:bg-emerald-500 selection:text-black font-sans">
        {/* Navbar Global */}
        <Navbar />

        {/* Contenido Dinámico */}
        <main className="flex-1 w-full relative">
          {children}
        </main>
      </body>
    </html>
  );
}