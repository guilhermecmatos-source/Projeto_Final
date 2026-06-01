"use client";

import { FileSpreadsheet, FileText, Files } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  exportarDocumentosCsv,
  exportarExcel,
  exportarPdf,
  type ColunaExportacao,
} from "@/lib/export/documents";

interface BarraExportacaoProps {
  titulo: string;
  subtitulo?: string;
  nomeArquivo: string;
  colunas: ColunaExportacao[];
  linhas: Record<string, unknown>[];
  retrato?: boolean;
}

export function BarraExportacao({
  titulo,
  subtitulo,
  nomeArquivo,
  colunas,
  linhas,
  retrato = true,
}: BarraExportacaoProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => exportarPdf({ titulo, subtitulo, colunas, linhas, nomeArquivo, retrato })}
      >
        <FileText className="h-4 w-4" />
        Exportar PDF
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() =>
          exportarExcel({ nomePlanilha: titulo, colunas, linhas, nomeArquivo })
        }
      >
        <FileSpreadsheet className="h-4 w-4" />
        Exportar Excel
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => exportarDocumentosCsv({ colunas, linhas, nomeArquivo })}
      >
        <Files className="h-4 w-4" />
        Exportar Documentos
      </Button>
    </div>
  );
}
