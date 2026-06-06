"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthHero from "@/components/auth/AuthHero";
import { authApi } from "@/services/api";
import { IMAGES } from "@/lib/images";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    <main className="flex min-h-screen-safe safe-area-padding bg-background">
      <AuthHero imageUrl={IMAGES.loginElectricCar} alt="Concessionária premium" />

      <section className="flex w-full flex-col items-center justify-center bg-background p-4 md:p-8 lg:w-1/2">
        <div className="w-full max-w-[480px] rounded-2xl border border-outline-variant bg-surface-container-low p-8 shadow-overlay">
          <header className="mb-8 text-center">
            <h2 className="mb-1 text-headline-md text-on-surface">Crie conta</h2>
            <p className="text-body-md text-on-surface-variant">
              Solicite acesso de Administrador, Gestor ou Motorista.
            </p>
          </header>

          {error && (
            <div className="mb-4 rounded-lg bg-error-container p-3 text-sm text-on-error-container">{error}</div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm text-on-surface-variant">Nome Completo</label>
              <input name="name" className="input-fleet" placeholder="Ex: Amanda Silveira" required />
            </div>
            <div>
              <label className="mb-1 block text-sm text-on-surface-variant">Email Corporativo</label>
              <input name="email" type="email" className="input-fleet" placeholder="seu@email.com.br" required />
            </div>
            <div>
              <label className="mb-1 block text-sm text-on-surface-variant">Menu de Cargo rbac</label>
              <select name="role" className="input-fleet" defaultValue="administrador">
                <option value="administrador">Administrador de Controle</option>
                <option value="gestor">Gestor de Logística</option>
                <option value="solicitante">Solicitante (Motorista)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-on-surface-variant">Senha de Acesso</label>
              <input name="password" type="password" className="input-fleet" placeholder="Mínimo 6 caracteres" minLength={6} required />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-tertiary-container text-sm font-bold uppercase text-white disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Solicitar Acesso"}
            </button>
          </form>

          <footer className="mt-6 text-center">
            <Link href="/login" className="text-sm text-on-surface-variant hover:text-primary">
              ← Voltar para Login
            </Link>
          </footer>
        </div>
      </section>
    </main>
  );
}
