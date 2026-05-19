"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@fleetplatform.com");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await authApi.login(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch {
      setError("Credenciais inválidas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-fleet-900 via-fleet-700 to-blue-500 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
      >
        <h1 className="mb-2 text-2xl font-bold text-fleet-900">FleetAI</h1>
        <p className="mb-6 text-slate-500">Gestão inteligente de frotas</p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium text-slate-700">E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-fleet-500 focus:outline-none focus:ring-2 focus:ring-fleet-500/20"
            required
          />
        </label>

        <label className="mb-6 block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Senha</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-fleet-500 focus:outline-none focus:ring-2 focus:ring-fleet-500/20"
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-fleet-600 py-3 font-semibold text-white transition hover:bg-fleet-700 disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className="mt-4 text-center text-xs text-slate-400">
          Admin padrão: admin@fleetplatform.com / Admin@123
        </p>
      </form>
    </div>
  );
}
