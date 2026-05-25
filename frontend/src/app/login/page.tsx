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
  const [email, setEmail] = useState("admin@fleetplatform.com");
  const [password, setPassword] = useState("Admin@123");
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
        setError(
          "Não foi possível conectar à API. Inicie o backend (porta 3001) e confira NEXT_PUBLIC_API_URL no frontend."
        );
      } else {
        setError(apiMsg || "Credenciais inválidas. Use admin@fleetplatform.com / Admin@123");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen">
      <AuthHero imageUrl={IMAGES.loginElectricCar} alt="Veículo elétrico moderno" />

      <section className="flex w-full items-center justify-center bg-surface p-4 md:p-8 lg:w-1/2">
        <div className="w-full max-w-[440px]">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Icon name="local_shipping" className="text-3xl text-primary" />
            <span className="text-headline-sm font-bold text-primary">FleetAI</span>
          </div>

          <header className="mb-8">
            <h2 className="mb-1 text-headline-md text-on-surface">Bem-vindo de volta</h2>
            <p className="text-body-md text-on-surface-variant">
              Acesse sua conta para gerenciar sua frota.
            </p>
          </header>

          {error && (
            <div className="mb-4 rounded-lg bg-error-container p-3 text-sm text-on-error-container">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-label-md uppercase tracking-wider text-on-surface-variant"
              >
                E-mail ou Usuário
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-fleet"
                placeholder="exemplo@fleetcontrol.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-label-md uppercase tracking-wider text-on-surface-variant"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-fleet pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary"
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
                  className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <span className="text-body-md text-on-surface-variant">Lembrar de mim</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-label-md font-bold text-primary hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-secondary h-14 w-full rounded-xl">
              {loading ? "Entrando..." : "Entrar"}
              <Icon name="arrow_forward" />
            </button>
          </form>

          <footer className="mt-8 border-t border-outline-variant pt-6 text-center">
            <p className="text-body-md text-on-surface-variant">
              Novo na plataforma?{" "}
              <Link href="/register" className="ml-1 font-bold text-primary hover:underline">
                Solicitar acesso
              </Link>
            </p>
          </footer>

          <div className="mt-6 flex items-center justify-center gap-2 text-outline opacity-60">
            <Icon name="lock" className="text-base" />
            <span className="text-label-md">Ambiente seguro e criptografado</span>
          </div>
        </div>
      </section>
    </main>
  );
}
