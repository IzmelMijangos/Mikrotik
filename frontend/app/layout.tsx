import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hotspot MikroTik - Sistema de Venta de Fichas",
  description: "Plataforma SaaS para administrar Hotspots MikroTik con venta de fichas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
