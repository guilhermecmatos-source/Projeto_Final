export interface KnowledgeEntry {
  keywords: string[];
  problem: string;
  solution: string;
  urgency: "low" | "medium" | "high";
}

export const VEHICLE_KNOWLEDGE: KnowledgeEntry[] = [
  {
    keywords: ["óleo", "oleo", "lubrificante", "nível"],
    problem: "Nível de óleo baixo ou vazamento",
    solution:
      "Verifique o nível com o motor frio. Se estiver abaixo da marca, complete com óleo especificado no manual. Vazamentos exigem inspeção imediata e troca de retentores.",
    urgency: "high",
  },
  {
    keywords: ["freio", "freios", "pedal", "barulho"],
    problem: "Sistema de freios comprometido",
    solution:
      "Inspecione pastilhas, discos e fluido de freio. Barulho metálico indica desgaste. Não opere o veículo até revisão em oficina credenciada.",
    urgency: "high",
  },
  {
    keywords: ["pneu", "pneus", "calibragem", "furado"],
    problem: "Pneus com problema",
    solution:
      "Calibre conforme placa do veículo. Verifique sulcos (mín. 1,6 mm). Troque pneu furado ou com bolha; alinhe e balanceie após substituição.",
    urgency: "medium",
  },
  {
    keywords: ["bateria", "partida", "não liga", "nao liga"],
    problem: "Falha elétrica / bateria",
    solution:
      "Teste tensão da bateria (12,4V+ parado). Limpe terminais. Se descarregar rápido, verifique alternador e consumo parasita.",
    urgency: "medium",
  },
  {
    keywords: ["aquecimento", "temperatura", "radiador", "superaquec"],
    problem: "Superaquecimento do motor",
    solution:
      "Pare o veículo com segurança. Não abra o radiador quente. Verifique nível de coolant, mangueiras e ventoinha. Reboque se necessário.",
    urgency: "high",
  },
  {
    keywords: ["consumo", "combustível", "combustivel", "gasto"],
    problem: "Consumo elevado de combustível",
    solution:
      "Revise pressão dos pneus, filtros de ar e combustível, injeção e hábitos de condução. Compare km/L com histórico da frota.",
    urgency: "low",
  },
  {
    keywords: ["luz", "painel", "check engine", "injecao"],
    problem: "Luz de advertência no painel",
    solution:
      "Anote o código com scanner OBD-II. Luz vermelha: pare. Amarela: agende diagnóstico em até 48h.",
    urgency: "medium",
  },
  {
    keywords: ["suspensao", "suspensão", "amortecedor", "batida", "pulo"],
    problem: "Problema na Suspensão / Amortecedores",
    solution:
      "Verifique se há vazamento de óleo nos amortecedores, desgaste nas buchas ou coxins. Ruídos de pancada seca ao passar em buracos indicam a necessidade de substituição imediata dos componentes de suspensão para evitar perda de controle do veículo.",
    urgency: "medium",
  },
  {
    keywords: ["ar condicionado", "ar-condicionado", "frio", "ventilador", "ventilação", "gelando"],
    problem: "Falha no Ar Condicionado",
    solution:
      "Se o ar não está gelando, verifique o filtro de cabine (pode estar obstruído) ou se há vazamento do gás refrigerante. Se a ventilação não liga, pode ser fusível queimado ou defeito no motor soprador.",
    urgency: "low",
  },
  {
    keywords: ["embreagem", "embreagem dura", "marcha", "cambio", "câmbio", "pedal embreagem"],
    problem: "Desgaste no Sistema de Embreagem",
    solution:
      "Pedal muito duro, trepidação ao arrancar ou dificuldade para engatar marchas são sinais claros de desgaste do disco e platô de embreagem. Agende a substituição do kit completo de embreagem para evitar ficar parado na via.",
    urgency: "high",
  },
  {
    keywords: ["farol", "farol queimado", "lanterna", "pisca", "luzes", "iluminação", "faróis"],
    problem: "Falha de Iluminação / Farol Queimado",
    solution:
      "Verifique as lâmpadas do farol, lanternas e setas. Substitua lâmpadas queimadas imediatamente. Se nenhuma acender, verifique o fusível correspondente ou o relé de acionamento.",
    urgency: "medium",
  },
  {
    keywords: ["correia", "correia dentada", "chiado", "barulho agudo", "correias", "alternador"],
    problem: "Desgaste ou Ruído na Correia",
    solution:
      "Ruídos agudos (chiados) ao ligar o carro ou esterçar indicam correia de acessórios frouxa ou gasta. Verifique também a correia dentada, cuja ruptura causa danos graves ao motor. Substitua conforme quilometragem especificada.",
    urgency: "high",
  },
];

export function findKnowledgeMatch(input: string): KnowledgeEntry | null {
  const lower = input.toLowerCase();
  let best: KnowledgeEntry | null = null;
  let bestScore = 0;

  for (const entry of VEHICLE_KNOWLEDGE) {
    const score = entry.keywords.filter((k) => lower.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  return bestScore > 0 ? best : null;
}

export function getAssistantReply(userMessage: string): string {
  const match = findKnowledgeMatch(userMessage);
  if (match) {
    return `**${match.problem}**\n\n${match.solution}\n\n_Urgência: ${match.urgency === "high" ? "Alta" : match.urgency === "medium" ? "Média" : "Baixa"}_`;
  }
  return (
    "Descreva sintomas com mais detalhes (barulhos, luzes do painel, vazamentos). " +
    "Posso ajudar com: óleo, freios, pneus, bateria, aquecimento, consumo, suspensão, ar condicionado, embreagem, faróis e correias."
  );
}
