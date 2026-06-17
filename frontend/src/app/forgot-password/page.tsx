"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import AuthHero from "@/components/auth/AuthHero";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const bgImage = "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=2000";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <main 
      className="flex min-h-screen bg-black"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.95) 20%, rgba(0,0,0,0.4) 100%), url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <AuthHero imageUrl="" />

      <section className="flex w-full flex-col items-center justify-center p-4 md:p-8 lg:w-1/2 relative z-10">
        <div className="w-full max-w-[400px] rounded-3xl border border-outline-variant/20 bg-[#0c132b]/95 backdrop-blur-md p-10 shadow-2xl">
          {!sent ? (
            <>
              <header className="mb-8 text-center">
                <h2 className="mb-2 text-2xl font-black text-white tracking-wide">Recuperar Credenciais</h2>
                <p className="text-[10px] font-medium text-slate-400">
                  Insira seu email para enviarmos instruções de redefinição.
                </p>
              </header>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-500">
                    E-mail Cadastrado
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl bg-[#0F172A] border border-outline-variant/30 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition"
                      placeholder="seu@email.com.br"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full bg-[#6c1628] hover:bg-[#841E34] py-3.5 text-[10px] font-black uppercase tracking-widest text-white transition shadow-lg shadow-red-900/20"
                >
                  RECUPERAR CREDENCIAIS
                </button>

                <div className="pt-2 text-center">
                  <Link
                    href="/login"
                    className="text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition"
                  >
                    ← Voltar para Login
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 border border-green-500/30">
                <span className="text-3xl text-green-400">✓</span>
              </div>
              <h4 className="mb-2 text-xl font-black text-white">Verifique seu e-mail</h4>
              <p className="mb-8 text-[11px] text-slate-400 leading-relaxed">
                Se houver uma conta associada ao e-mail informado, você receberá instruções para
                redefinir sua senha em instantes.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="w-full rounded-full border border-outline-variant/30 hover:bg-white/5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-300 transition"
              >
                Tentar outro e-mail
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
