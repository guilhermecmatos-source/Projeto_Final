"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { authApi } from "@/services/api";

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
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Não foi possível criar a conta.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 shadow-raised">
        <h1 className="mb-2 text-headline-lg">Solicitar Acesso</h1>
        <p className="mb-6 text-body-md text-on-surface-variant">
          Crie sua conta de cliente na plataforma FleetAI.
        </p>
        {error && (
          <p className="mb-4 rounded-lg bg-error-container/20 px-3 py-2 text-body-md text-error">{error}</p>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-label-md">Nome</label>
            <input name="name" className="input-fleet" required />
          </div>
          <div>
            <label className="mb-1 block text-label-md">E-mail</label>
            <input name="email" type="email" className="input-fleet" required />
          </div>
          <div>
            <label className="mb-1 block text-label-md">Senha</label>
            <input name="password" type="password" className="input-fleet" minLength={6} required />
          </div>
          <button type="submit" disabled={loading} className="btn-secondary w-full">
            {loading ? "Criando..." : "Criar Conta"}
            <Icon name="arrow_forward" />
          </button>
        </form>
        <p className="mt-6 text-center text-body-md">
          Já tem conta?{" "}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
