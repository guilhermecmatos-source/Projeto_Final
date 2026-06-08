import Link from "next/link";
import Icon from "./Icon";

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <Icon name="lock" className="text-5xl text-error" />
      <h1 className="text-headline-md text-on-surface">Acesso negado</h1>
      <p className="max-w-md text-body-md text-on-surface-variant">
        Você não tem permissão para acessar esta página.
      </p>
      <Link href="/dashboard" className="btn-primary">
        <Icon name="dashboard" />
        Voltar ao Dashboard
      </Link>
    </div>
  );
}
