import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export interface ColunaExportacao {
  header: string;
  key: string;
}

export function exportarPdf(opcoes: {
  titulo: string;
  subtitulo?: string;
  colunas: ColunaExportacao[];
  linhas: Record<string, unknown>[];
  nomeArquivo: string;
  retrato?: boolean;
}) {
  const doc = new jsPDF({
    orientation: opcoes.retrato !== false ? "portrait" : "landscape",
    unit: "mm",
    format: "a4",
  });
  doc.setFontSize(16);
  doc.text(opcoes.titulo, 14, 18);
  if (opcoes.subtitulo) {
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(opcoes.subtitulo, 14, 26);
    doc.setTextColor(0);
  }
  autoTable(doc, {
    startY: opcoes.subtitulo ? 32 : 24,
    head: [opcoes.colunas.map((c) => c.header)],
    body: opcoes.linhas.map((linha) =>
      opcoes.colunas.map((c) => String(linha[c.key] ?? ""))
    ),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [14, 165, 233] },
  });
  doc.save(`${opcoes.nomeArquivo}.pdf`);
}

export function exportarExcel(opcoes: {
  nomePlanilha: string;
  colunas: ColunaExportacao[];
  linhas: Record<string, unknown>[];
  nomeArquivo: string;
}) {
  const dados = opcoes.linhas.map((linha) => {
    const obj: Record<string, string> = {};
    opcoes.colunas.forEach((c) => {
      obj[c.header] = String(linha[c.key] ?? "");
    });
    return obj;
  });
  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, opcoes.nomePlanilha.slice(0, 31));
  XLSX.writeFile(wb, `${opcoes.nomeArquivo}.xlsx`);
}

export function exportarDocumentosCsv(opcoes: {
  colunas: ColunaExportacao[];
  linhas: Record<string, unknown>[];
  nomeArquivo: string;
}) {
  const cabecalho = opcoes.colunas.map((c) => c.header).join(";");
  const corpo = opcoes.linhas
    .map((linha) =>
      opcoes.colunas
        .map((c) => `"${String(linha[c.key] ?? "").replace(/"/g, '""')}"`)
        .join(";")
    )
    .join("\n");
  const blob = new Blob([`\uFEFF${cabecalho}\n${corpo}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${opcoes.nomeArquivo}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
