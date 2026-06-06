"use client";

import Link from "next/link";

interface AuthHeroProps {
  imageUrl: string;
  alt?: string;
}

export default function AuthHero({ imageUrl, alt = "" }: AuthHeroProps) {
  return (
    <section
      className="relative hidden flex-col justify-between overflow-hidden bg-black bg-login-hero p-10 lg:flex lg:w-1/2"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.85)), url(${imageUrl})`,
      }}
      aria-label={alt}
    >
      <header className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-lg font-black text-on-primary">
          F
        </span>
        <div>
          <p className="font-bold text-white">FLEETAI</p>
          <p className="text-xs text-on-surface-variant">CONTROL SYSTEM</p>
        </div>
      </header>

      <div className="relative z-10 max-w-lg">
        <h1 className="mb-2 text-4xl font-black uppercase leading-tight text-primary">
          FleetAI
          <br />
          Sistema de
          <br />
          Controle
        </h1>
        <div className="mb-6 h-1 w-16 bg-primary" />
        <p className="mb-2 text-white">Sistema Turbo S • Edição Fleet AI</p>
        <p className="text-sm leading-relaxed text-on-surface-variant">
          Painel operacional para gestão inteligente de pátio logística de alta voltagem,
          combinando diagnósticos profundos e restrição rbac em tempo-real.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-block rounded-xl bg-tertiary-container px-8 py-3 text-sm font-bold uppercase text-white transition hover:opacity-90"
        >
          Criar Conta
        </Link>
      </div>

      <footer className="text-[10px] uppercase tracking-widest text-on-surface-variant">
        Fleet AI Core Portal
      </footer>
    </section>
  );
}
