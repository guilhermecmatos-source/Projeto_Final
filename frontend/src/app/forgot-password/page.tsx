"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <main className="flex min-h-screen">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-mesh p-8 lg:flex lg:w-1/2">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0 L0 0 0 40' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <div className="rounded-lg bg-white p-1">
            <Icon name="terminal" className="text-3xl text-primary" filled />
          </div>
          <h1 className="text-headline-md text-white">FleetAI</h1>
        </div>
        <div className="relative z-10 max-w-lg">
          <h2 className="mb-4 text-headline-lg leading-tight text-white">
            Mantenha o controle da sua infraestrutura.
          </h2>
          <p className="text-body-lg text-on-primary-container/90">
            A plataforma FleetAI oferece inteligência em tempo real para operadores que demandam
            precisão e confiabilidade em logística de alta escala.
          </p>
        </div>
        <p className="relative z-10 text-label-md text-on-primary-container">
          Confiado por mais de 5.000 operadores globais.
        </p>
      </section>

      <section className="flex w-full items-center justify-center bg-surface p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          {!sent ? (
            <>
              <header className="mb-8 text-center lg:text-left">
                <h3 className="mb-1 text-headline-lg text-on-surface">Esqueceu sua senha?</h3>
                <p className="text-body-md text-on-surface-variant">
                  Digite seu e-mail cadastrado e enviaremos um link de recuperação.
                </p>
              </header>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-label-md text-on-surface-variant"
                  >
                    E-MAIL CORPORATIVO
                  </label>
                  <div className="relative">
                    <Icon
                      name="mail"
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"
                    />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-fleet pl-12"
                      placeholder="exemplo@fleetai.com"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-secondary w-full uppercase tracking-wider">
                  Enviar Link de Recuperação
                  <Icon name="arrow_forward" className="text-lg" />
                </button>

                <div className="border-t border-outline-variant pt-4 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1 text-label-md font-bold text-primary hover:underline"
                  >
                    <Icon name="arrow_back" className="text-base" />
                    Voltar para o login
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <div className="rounded-xl border border-outline-variant bg-surface-container-low p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container">
                <Icon name="check_circle" className="text-3xl text-on-secondary-container" filled />
              </div>
              <h4 className="mb-1 text-headline-sm text-on-surface">Verifique seu e-mail</h4>
              <p className="mb-6 text-body-md text-on-surface-variant">
                Se houver uma conta associada ao e-mail informado, você receberá instruções para
                redefinir sua senha em instantes.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="w-full rounded-lg border border-primary py-2 text-label-md text-primary transition hover:bg-primary-fixed"
              >
                Tentar outro e-mail
              </button>
            </div>
          )}

          <p className="mt-8 text-center text-label-md text-on-surface-variant">
            Precisa de ajuda?{" "}
            <button type="button" className="text-primary hover:underline">
              Entre em contato com o suporte
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
