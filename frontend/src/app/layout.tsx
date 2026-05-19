import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "FleetAI - Gestão Inteligente de Frotas",
  description: "Plataforma de mobilidade, logística e gestão de frotas com IA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Navbar />
        <main className="min-h-[calc(100vh-56px)]">{children}</main>
      </body>
    </html>
  );
}
