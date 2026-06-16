import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="raised-card p-6 border border-red-500/20 bg-[#1e141a] rounded-xl text-center space-y-4">
          <span className="material-symbols-outlined text-4xl text-red-400">error</span>
          <h3 className="text-base font-bold text-slate-100">Painel Temporariamente Indisponível</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Ocorreu um problema ao processar e desenhar as informações na tela. Isso geralmente é causado por uma oscilação na rede ou dados corrompidos.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="rounded bg-red-500/20 hover:bg-red-500/35 border border-red-500/30 text-red-400 px-4 py-2 text-xs font-bold uppercase transition"
          >
            Tentar Restaurar Painel
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
