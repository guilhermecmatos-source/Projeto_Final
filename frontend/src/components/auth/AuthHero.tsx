"use client";

import Link from "next/link";

interface AuthHeroProps {
  imageUrl?: string;
  alt?: string;
}

export default function AuthHero({ imageUrl = "", alt = "" }: AuthHeroProps) {
  const hasBg = imageUrl !== "";

  return (
    <section
      className={`relative hidden flex-col justify-between overflow-hidden p-10 lg:flex lg:w-1/2 ${
        hasBg ? "bg-black bg-login-hero" : "bg-transparent"
      }`}
      style={
        hasBg
          ? {
              backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.4) 100%), url(${imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
      aria-label={alt}
    >
      <header className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FCA311] text-lg font-black text-[#0c132b]">
          F
        </span>
        <div>
          <p className="font-black text-[#FCA311] tracking-widest text-lg">FLEETAI</p>
          <p className="text-[8px] font-bold tracking-widest text-slate-500">CONTROL SYSTEM</p>
        </div>
      </header>

      <div className="relative z-10 max-w-lg">
        <h1 className="mb-6 text-6xl font-black uppercase leading-none text-[#FCA311] tracking-tighter">
          FLEETAI<br />
          SISTEMA DE<br />
          CONTROLE
        </h1>
        <p className="mb-4 text-xl text-slate-300">Sistema Turbo S • Edição Fleet AI</p>
        <p className="text-sm leading-relaxed text-slate-400 font-medium">
          Painel operacional para gestão inteligente de pátio logística de alta voltagem,
          combinando diagnósticos profundos e restrição rbac em tempo-real.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-block rounded-full bg-[#6c1628] hover:bg-[#841E34] px-8 py-3 text-[11px] font-black uppercase tracking-widest text-white transition shadow-lg shadow-red-900/20"
        >
          CRIAR CONTA
        </Link>
      </div>

      <footer className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-600">
        <span>FLEET AI CORE PORTAL</span>
        <span>© 2026 FLEETAI LOGISTICS • RBAC AUTH V4.2.8</span>
      </footer>
    </section>
  );
}
