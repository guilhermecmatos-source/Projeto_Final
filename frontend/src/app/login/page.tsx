"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { authApi } from "@/services/api";
import { ensureCurrentProfileInList } from "@/lib/profiles";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@fleetai.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Using the user-provided login background image
  const bgImage = "/images/login-bg.jpg";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (email.toLowerCase().includes("admin") && password !== "admin123") {
      setError("Credenciais inválidas. Use admin@fleetai.com.br / admin123");
      setLoading(false);
      return;
    }

    try {
      const { data } = await authApi.login(email.trim(), password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      ensureCurrentProfileInList(data.user);
      if (remember) localStorage.setItem("remember", "1");
      router.push("/dashboard");
    } catch (err: unknown) {
      const apiMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(apiMsg || "Credenciais inválidas. Verifique a API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main 
      className="flex min-h-screen bg-black items-center justify-center relative"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <section className="flex w-full flex-col items-center justify-center p-4 md:p-8 relative z-10">
        <div className="w-full max-w-[400px] rounded-3xl border border-outline-variant/20 bg-[#0c132b]/95 backdrop-blur-md p-10 shadow-2xl">
          <header className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-black text-white tracking-wide">Login</h2>
            <p className="text-[10px] font-medium text-slate-400">
              Faça login com a porta de acesso ou as contas rápidas.
            </p>
          </header>

          {error && (
            <div role="alert" className="mb-4 rounded-lg bg-error/20 border border-error/50 p-3 text-[11px] font-medium text-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-500">
                Email
              </label>
              <div className="relative">
                <Icon name="mail" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-[#0F172A] border border-outline-variant/30 pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition"
                  placeholder="seu@email.com.br ou admin"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-500">
                Password
              </label>
              <div className="relative">
                <Icon name="key" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-[#0F172A] border border-outline-variant/30 pl-10 pr-10 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition"
                  placeholder="••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
                >
                  <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-sm" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-outline-variant/30 bg-[#0F172A] text-blue-500 focus:ring-0 w-3 h-3"
                />
                <span className="text-[10px] font-medium text-slate-400">Lembrar me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-[10px] font-medium text-slate-400 hover:text-white transition"
              >
                esqueci senha
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-full bg-[#6c1628] hover:bg-[#841E34] py-3.5 text-[10px] font-black uppercase tracking-widest text-white transition shadow-lg shadow-red-900/20 disabled:opacity-50"
            >
              {loading ? "ENTRANDO..." : "LOGIN"}
            </button>
            
            <div className="pt-2 text-center">
              <Link 
                href="/register"
                className="text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition"
              >
                CRIAR UMA CONTA
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
