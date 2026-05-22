"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/ui/Icon";

interface FormShellProps {
  title: string;
  subtitle?: string;
  backHref: string;
  backLabel?: string;
  children: ReactNode;
  onSubmit: (form: FormData) => Promise<void>;
  submitLabel?: string;
  redirectOnSuccess?: string;
}

export default function FormShell({
  title,
  subtitle,
  backHref,
  backLabel = "Voltar",
  children,
  onSubmit,
  submitLabel = "Salvar",
  redirectOnSuccess,
}: FormShellProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      await onSubmit(form);
      setSuccess("Registro salvo com sucesso.");
      if (redirectOnSuccess) {
        setTimeout(() => router.push(redirectOnSuccess), 800);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Não foi possível salvar. Verifique os dados e tente novamente.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell headerTitle={title}>
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center gap-1 text-label-md text-primary hover:underline"
      >
        <Icon name="arrow_back" className="text-base" />
        {backLabel}
      </Link>

      <h1 className="mb-2 text-headline-lg">{title}</h1>
      {subtitle && <p className="mb-8 text-body-md text-on-surface-variant">{subtitle}</p>}

      {error && (
        <div className="mb-4 rounded-lg border border-error bg-error-container/20 px-4 py-3 text-body-md text-error">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-primary bg-primary-container/10 px-4 py-3 text-body-md text-primary">
          {success}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        {children}
        <button type="submit" disabled={loading} className="btn-primary">
          <Icon name="save" />
          {loading ? "Salvando..." : submitLabel}
        </button>
      </form>
    </AppShell>
  );
}
