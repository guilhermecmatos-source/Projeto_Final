"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface ColunaTabela<T> {
  chave: keyof T & string;
  titulo: string;
  ordenavel?: boolean;
  render?: (linha: T) => React.ReactNode;
}

interface DataTableProps<T extends Record<string, unknown>> {
  dados: T[];
  colunas: ColunaTabela<T>[];
  chavesBusca?: (keyof T & string)[];
  porPagina?: number;
  vazio?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  dados,
  colunas,
  chavesBusca,
  porPagina = 8,
  vazio = "Nenhum registro encontrado.",
}: DataTableProps<T>) {
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<{ chave: string; dir: "asc" | "desc" } | null>(null);
  const [pagina, setPagina] = useState(0);

  const filtrados = useMemo(() => {
    let linhas = [...dados];
    if (busca.trim()) {
      const q = busca.toLowerCase();
      linhas = linhas.filter((l) =>
        (chavesBusca ?? colunas.map((c) => c.chave)).some((k) =>
          String(l[k] ?? "").toLowerCase().includes(q)
        )
      );
    }
    if (ordem) {
      linhas.sort((a, b) => {
        const av = String(a[ordem.chave] ?? "");
        const bv = String(b[ordem.chave] ?? "");
        return ordem.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return linhas;
  }, [dados, busca, ordem, chavesBusca, colunas]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina));
  const paginaAtual = filtrados.slice(pagina * porPagina, (pagina + 1) * porPagina);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          className="pl-9"
          placeholder="Buscar..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPagina(0);
          }}
        />
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-900/90 text-left text-gray-400">
            <tr>
              {colunas.map((col) => (
                <th key={col.chave} className="px-4 py-3 font-medium">
                  {col.ordenavel !== false ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-gray-200"
                      onClick={() =>
                        setOrdem((o) =>
                          o?.chave === col.chave
                            ? { chave: col.chave, dir: o.dir === "asc" ? "desc" : "asc" }
                            : { chave: col.chave, dir: "asc" }
                        )
                      }
                    >
                      {col.titulo}
                      {ordem?.chave === col.chave &&
                        (ordem.dir === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        ))}
                    </button>
                  ) : (
                    col.titulo
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginaAtual.length === 0 ? (
              <tr>
                <td colSpan={colunas.length} className="px-4 py-12 text-center text-gray-500">
                  {vazio}
                </td>
              </tr>
            ) : (
              paginaAtual.map((linha, i) => (
                <tr
                  key={i}
                  className="border-t border-gray-800/80 transition hover:bg-gray-900/50"
                >
                  {colunas.map((col) => (
                    <td key={col.chave} className="px-4 py-3 text-gray-200">
                      {col.render ? col.render(linha) : String(linha[col.chave] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          {filtrados.length} registro(s) · pág. {pagina + 1}/{totalPaginas}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={pagina === 0} onClick={() => setPagina((p) => p - 1)}>
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pagina >= totalPaginas - 1}
            onClick={() => setPagina((p) => p + 1)}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}
