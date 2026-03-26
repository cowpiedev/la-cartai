import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "La Carta IA — Cartas digitales para hostelería",
    template: "%s | La Carta IA",
  },
  description:
    "Plataforma SaaS para gestión de cartas digitales en negocios de hostelería. Acceso vía QR sin registro.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${manrope.variable}`}>
      <body className="bg-surface text-on-surface font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
