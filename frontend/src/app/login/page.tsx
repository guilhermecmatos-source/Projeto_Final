"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import AuthHero from "@/components/auth/AuthHero";
import { authApi } from "@/services/api";
import { IMAGES } from "@/lib/images";
import { ensureCurrentProfileInList } from "@/lib/profiles";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@fleetai.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await authApi.login(email.trim(), password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      ensureCurrentProfileInList(data.user);
      if (remember) localStorage.setItem("remember", "1");
      router.push("/dashboard");
    } catch (err: unknown) {
      const apiMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      if (!apiMsg && !(err as { response?: unknown })?.response) {
        setError("Não foi possível conectar à API. Verifique se o Docker está rodando (docker compose up).");
      } else {
        setError(apiMsg || "Credenciais inválidas. Use admin@fleetai.com / admin123");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen-safe safe-area-padding bg-background">
      <AuthHero imageUrl={IMAGES.loginElectricCar} alt="Concessionária premium" />

      <section className="flex w-full flex-col items-center justify-center bg-background p-4 md:p-8 lg:w-1/2">
        <div className="mb-6 flex w-full max-w-[440px] items-center justify-between lg:max-w-[480px]">
          <div className="flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-primary font-black text-on-primary">F</span>
            <span className="font-bold text-primary">FLEETAI</span>
          </div>
          <span className="hidden rounded-full border border-primary/40 px-3 py-1 text-[10px] font-bold text-primary lg:inline">
            ★ PREMIUM UI MODELO ATIVO
          </span>
        </div>

        <div className="w-full max-w-[480px] rounded-2xl border border-outline-variant bg-surface-container-low p-8 shadow-overlay">
          <header className="mb-8 text-center">
            <h2 className="mb-1 text-headline-md text-on-surface">Login</h2>
            <p className="text-body-md text-on-surface-variant">
              Faça login com a porta de acesso ou as contas rápidas.
            </p>
          </header>

          {error && (
            <div className="mb-4 rounded-lg bg-error-container p-3 text-sm text-on-error-container">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm text-on-surface-variant">
                Email
              </label>
              <div className="relative">
                <Icon name="mail" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-fleet pl-10"
                  placeholder="seu@email.com.br ou admin"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm text-on-surface-variant">
                Password
              </label>
              <div className="relative">
                <Icon name="key" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-fleet pl-10 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  <Icon name={showPassword ? "visibility_off" : "visibility"} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-outline-variant text-primary"
                />
                <span className="text-sm text-on-surface-variant">Lembrar me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-on-surface hover:text-primary">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-tertiary-container text-sm font-bold uppercase text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Login"}
            </button>
          </form>

          <footer className="mt-6 text-center">
            <Link href="/register" className="text-sm font-semibold text-on-surface-variant hover:text-primary">
              SIGN UP
            </Link>
          </footer>
        </div>

        <p className="mt-8 text-[10px] uppercase tracking-widest text-on-surface-variant">
          © 2026 FLEETAI LOGISTICS • RBAC AUTH V4.2.0
        </p>
      </section>
    </main>
  );
}
