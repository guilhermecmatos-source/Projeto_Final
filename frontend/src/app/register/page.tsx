"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthHero from "@/components/auth/AuthHero";
import { authApi } from "@/services/api";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bgImage = "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=2000";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await authApi.register(
        String(form.get("name")),
        String(form.get("email")),
        String(form.get("password"))
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          "Não foi possível criar a conta."
      );
    } finally {
      setLoading(false);
    }
  }

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
          <header className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-black text-white tracking-wide">Crie conta</h2>
            <p className="text-[10px] font-medium text-slate-400">
              Solicite acesso de Administrador, Gestor ou Motorista.
            </p>
          </header>

          {error && (
            <div role="alert" className="mb-4 rounded-lg bg-error/20 border border-error/50 p-3 text-[11px] font-medium text-error">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-500">Nome Completo</label>
              <input 
                name="name" 
                className="w-full rounded-xl bg-[#0F172A] border border-outline-variant/30 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition" 
                placeholder="Ex: Amanda Silveira ou Julian" 
                required 
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-500">Email Corporativo</label>
              <input 
                name="email" 
                type="email" 
                className="w-full rounded-xl bg-[#0F172A] border border-outline-variant/30 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition" 
                placeholder="seu@email.com.br" 
                required 
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-500">Menu de Cargo rbac</label>
              <select 
                name="role" 
                className="w-full rounded-xl bg-[#0F172A] border border-outline-variant/30 px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition appearance-none" 
                defaultValue="administrador"
              >
                <option value="administrador">Administrador de Controle</option>
                <option value="gestor">Gestor de Logística</option>
                <option value="solicitante">Solicitante (Motorista)</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-500">Senha de Acesso</label>
              <input 
                name="password" 
                type="password" 
                className="w-full rounded-xl bg-[#0F172A] border border-outline-variant/30 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition" 
                placeholder="Mínimo 6 caracteres" 
                minLength={6} 
                required 
              />
            </div>
            
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                required
                className="rounded border-outline-variant/30 bg-[#0F172A] text-blue-500 focus:ring-0 w-3 h-3 cursor-pointer"
              />
              <span className="text-[9px] font-medium text-white">Aceito os Termos de Uso e LGPD da FleetAI</span>
            </div>

            <div className="bg-[#FCA311]/10 border border-[#FCA311]/30 rounded-lg p-3 my-4">
              <p className="text-[8px] font-bold text-[#FCA311] leading-relaxed">
                ■ Nota: Seu cadastro será enviado para o Administrador do sistema para aprovação do perfil rbac antes do acesso ser liberado.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-full bg-[#6c1628] hover:bg-[#841E34] py-3.5 text-[10px] font-black uppercase tracking-widest text-white transition shadow-lg shadow-red-900/20 disabled:opacity-50"
            >
              {loading ? "ENVIANDO..." : "SOLICITAR ENTRADA (ENVIAR AO ADM)"}
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
        </div>
      </section>
    </main>
  );
}
