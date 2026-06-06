export type ContractArea = "trabalhista" | "previdenciario";
export type ContractTemplateKey =
  | "kit_trabalhista"
  | "procuracao_trabalhista"
  | "hipossuficiencia"
  | "kit_previdenciario"
  | "procuracao_previdenciario";

export interface ContractTemplate {
  key: ContractTemplateKey;
  area: ContractArea;
  label: string;
  description: string;
  includes: string[];
}

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    key: "kit_trabalhista",
    area: "trabalhista",
    label: "Kit Contrato Trabalhista",
    description: "Contrato de honorários + Procuração + Declaração de Hipossuficiência",
    includes: ["Contrato de Honorários", "Procuração Ad Judicia", "Declaração de Hipossuficiência"],
  },
  {
    key: "procuracao_trabalhista",
    area: "trabalhista",
    label: "Procuração Trabalhista",
    description: "Procuração ad judicia et extra para ações trabalhistas",
    includes: ["Procuração Ad Judicia"],
  },
  {
    key: "hipossuficiencia",
    area: "trabalhista",
    label: "Declaração de Hipossuficiência",
    description: "Declaração para fins de gratuidade de justiça",
    includes: ["Declaração de Hipossuficiência"],
  },
  {
    key: "kit_previdenciario",
    area: "previdenciario",
    label: "Kit Contrato Previdenciário",
    description: "Contrato de honorários + Procuração + Declaração de Hipossuficiência",
    includes: ["Contrato de Honorários", "Procuração INSS", "Declaração de Hipossuficiência"],
  },
  {
    key: "procuracao_previdenciario",
    area: "previdenciario",
    label: "Procuração Previdenciária",
    description: "Procuração para ações perante o INSS",
    includes: ["Procuração INSS"],
  },
];

export function getTemplatesByArea(area: ContractArea): ContractTemplate[] {
  return CONTRACT_TEMPLATES.filter((t) => t.area === area);
}

export function getDefaultTemplateForArea(area: ContractArea): ContractTemplateKey {
  return area === "trabalhista" ? "kit_trabalhista" : "kit_previdenciario";
}

export function renderContractContent(
  templateKey: ContractTemplateKey,
  data: {
    clientName: string;
    clientCpf?: string;
    clientEmail?: string;
    honorarios?: number;
    city?: string;
    date?: string;
  }
): string {
  const city = data.city || "São Paulo";
  const date = data.date || new Date().toLocaleDateString("pt-BR");
  const cpf = data.clientCpf || "___________________";
  const honorarios = (data.honorarios ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const procuracao = `
PROCURAÇÃO AD JUDICIA ET EXTRA

OUTORGANTE: ${data.clientName}, CPF ${cpf}, e-mail ${data.clientEmail || "___________________"}.

OUTORGADO: Escritório FleetAI Jurídico, OAB/SP nº 000.000, com escritório na ${city}.

PODERES: Confere poderes para o foro em geral, com cláusula ad judicia et extra, podendo propor ações, contestar, transigir, receber, dar quitação, substabelecer e praticar todos os atos necessários.

${city}, ${date}.

_________________________________
${data.clientName}
OUTORGANTE
`.trim();

  const hipossuficiencia = `
DECLARAÇÃO DE HIPOSSUFICIÊNCIA

Eu, ${data.clientName}, CPF ${cpf}, declaro, sob as penas da lei, que não possuo condições de arcar com custas processuais e honorários advocatícios sem prejuízo do sustento próprio e de minha família, requerendo os benefícios da gratuidade de justiça (Lei nº 1.060/50 e art. 98 do CPC).

${city}, ${date}.

_________________________________
${data.clientName}
`.trim();

  const contratoTrabalhista = `
CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS — TRABALHISTA

CONTRATANTE: ${data.clientName}, CPF ${cpf}.
CONTRATADO: Escritório FleetAI Jurídico.

CLÁUSULA 1ª — DO OBJETO: Prestação de serviços advocatícios na esfera trabalhista, incluindo análise, negociação e ajuizamento de ações.

CLÁUSULA 2ª — DOS HONORÁRIOS: ${honorarios}, sendo 30% sobre êxito na fase de conhecimento e 20% na execução.

CLÁUSULA 3ª — DO PAGAMENTO: Conforme acordado na proposta comercial anexa.

${city}, ${date}.

_________________________________
CONTRATANTE                    _________________________________
                               CONTRATADO
`.trim();

  const contratoPrevidenciario = `
CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS — PREVIDENCIÁRIO

CONTRATANTE: ${data.clientName}, CPF ${cpf}.
CONTRATADO: Escritório FleetAI Jurídico.

CLÁUSULA 1ª — DO OBJETO: Assessoria e representação perante o INSS para concessão, revisão ou restabelecimento de benefícios previdenciários.

CLÁUSULA 2ª — DOS HONORÁRIOS: ${honorarios}, correspondente a 3 (três) benefícios mensais em caso de êxito.

CLÁUSULA 3ª — DA DOCUMENTAÇÃO: O contratante compromete-se a fornecer documentos necessários ao processo administrativo/judicial.

${city}, ${date}.

_________________________________
CONTRATANTE                    _________________________________
                               CONTRATADO
`.trim();

  const procuracaoInss = `
PROCURAÇÃO — INSS / PREVIDENCIÁRIO

OUTORGANTE: ${data.clientName}, CPF ${cpf}.

OUTORGADO: Escritório FleetAI Jurídico, OAB/SP nº 000.000.

PODERES: Representar perante o INSS, Receita Federal e demais órgãos previdenciários, podendo requerer benefícios, interpor recursos, assinar documentos e receber valores.

${city}, ${date}.

_________________________________
${data.clientName}
`.trim();

  switch (templateKey) {
    case "kit_trabalhista":
      return [contratoTrabalhista, procuracao, hipossuficiencia].join("\n\n---\n\n");
    case "procuracao_trabalhista":
      return procuracao;
    case "hipossuficiencia":
      return hipossuficiencia;
    case "kit_previdenciario":
      return [contratoPrevidenciario, procuracaoInss, hipossuficiencia].join("\n\n---\n\n");
    case "procuracao_previdenciario":
      return procuracaoInss;
    default:
      return contratoTrabalhista;
  }
}
