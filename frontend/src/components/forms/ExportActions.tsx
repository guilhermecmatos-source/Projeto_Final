"use client";

import { FileSpreadsheet, FileText, Files } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  exportarDocumentosCsv,
  exportarExcel,
  exportarPdf,
  type ColunaExportacao,
} from "@/lib/export/documents";

interface ExportActionsProps {
  title: string;
  subtitle?: string;
  filename: string;
  columns: ColunaExportacao[];
  rows: Record<string, unknown>[];
  portrait?: boolean;
}

export default function ExportActions({
  title,
  subtitle,
  filename,
  columns,
  rows,
  portrait = true,
}: ExportActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() =>
          exportarPdf({ titulo: title, subtitulo: subtitle, colunas: columns, linhas: rows, nomeArquivo: filename, retrato: portrait })
        }
      >
        <FileText className="h-4 w-4" />
        Exportar PDF
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() =>
          exportarExcel({ nomePlanilha: title.slice(0, 31), colunas: columns, linhas: rows, nomeArquivo: filename })
        }
      >
        <FileSpreadsheet className="h-4 w-4" />
        Exportar Excel
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => exportarDocumentosCsv({ colunas: columns, linhas: rows, nomeArquivo: filename })}
      >
        <Files className="h-4 w-4" />
        Exportar Documentos
      </Button>
    </div>
  );
}
