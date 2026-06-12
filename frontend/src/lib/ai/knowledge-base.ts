export interface KnowledgeEntry {
  keywords: string[];
  problem: string;
  solution: string;
  urgency: "low" | "medium" | "high";
  causes?: string;
  advice?: string;
}

export const VEHICLE_KNOWLEDGE: KnowledgeEntry[] = [
  {
    keywords: ["óleo", "oleo", "lubrificante", "nível", "nivel"],
    problem: "Nível de óleo baixo ou vazamento",
    solution:
      "Verifique o nível com o motor frio. Se estiver abaixo da marca, complete com óleo especificado no manual. Vazamentos exigem inspeção imediata e troca de retentores.",
    causes:
      "Vedação de retentores desgastada, junta danificada ou consumo excessivo de óleo pelo motor.",
    advice:
      "Monitore o nível a cada parada e registre o consumo para encaminhar à oficina antes de uma viagem longa.",
    urgency: "high",
  },
  {
    keywords: ["freio", "freios", "pedal", "barulho", "chiado", "travão", "travao"],
    problem: "Sistema de freios comprometido",
    solution:
      "Inspecione pastilhas, discos e fluido de freio. Barulho metálico indica desgaste. Não opere o veículo até revisão em oficina credenciada.",
    causes:
      "Pastilhas gastas, discos empenados ou fluido contaminado podem reduzir a eficiência de frenagem.",
    advice:
      "Se notar barulho ou perda de eficácia, pare o veículo e agende manutenção urgente para evitar risco de acidente.",
    urgency: "high",
  },
  {
    keywords: ["pneu", "pneus", "calibragem", "furado", "bolha", "vazamento", "calibrado"],
    problem: "Pneus com problema",
    solution:
      "Calibre conforme placa do veículo. Verifique sulcos (mín. 1,6 mm). Troque pneu furado ou com bolha; alinhe e balanceie após substituição.",
    causes:
      "Pressão irregular, impactos em buracos ou desgaste excessivo podem causar danos ao pneu.",
    advice:
      "Faça inspeções regulares e não utilize o veículo com pneus danificados ou baixa calibragem.",
    urgency: "medium",
  },
  {
    keywords: ["bateria", "partida", "não liga", "nao liga", "carga", "alternador", "cabo", "estart"],
    problem: "Falha elétrica / bateria",
    solution:
      "Teste tensão da bateria (12,4V+ parado). Limpe terminais. Se descarregar rápido, verifique alternador e consumo parasita.",
    causes:
      "Bateria velha, alternador defeituoso ou consumo de energia parado podem impedir a partida.",
    advice:
      "Registre a tensão com o veículo parado e em funcionamento para confirmar se o alternador está carregando corretamente.",
    urgency: "medium",
  },
  {
    keywords: ["aquecimento", "temperatura", "radiador", "superaquec", "coolant", "água", "agua"],
    problem: "Superaquecimento do motor",
    solution:
      "Pare o veículo com segurança. Não abra o radiador quente. Verifique nível de coolant, mangueiras e ventoinha. Reboque se necessário.",
    causes:
      "Fuga de líquido, bomba d'água com falha ou válvula termostática emperrada podem causar superaquecimento.",
    advice:
      "Não continue viagem em caso de superaquecimento. Reboque o veículo e faça diagnóstico imediato.",
    urgency: "high",
  },
  {
    keywords: ["consumo", "combustível", "combustivel", "gasto", "km/l", "econômico", "economico", "gastando"],
    problem: "Consumo elevado de combustível",
    solution:
      "Revise pressão dos pneus, filtros de ar e combustível, injeção e hábitos de condução. Compare km/L com histórico da frota.",
    causes:
      "Pneus murchos, filtro de ar sujo ou ajustes de injeção fora do parâmetro aumentam o consumo.",
    advice:
      "Analise o histórico de consumo e realize manutenção preventiva para reduzir custos operacionais.",
    urgency: "low",
  },
  {
    keywords: ["luz", "painel", "check engine", "injecao", "injeção", "código", "codigo", "diagnóstico"],
    problem: "Luz de advertência no painel",
    solution:
      "Anote o código com scanner OBD-II. Luz vermelha: pare. Amarela: agende diagnóstico em até 48h.",
    causes:
      "Sensores com defeito, falha de injeção ou problemas de emissões podem acionar as luzes de aviso.",
    advice:
      "Use scanner OBD para registrar o código e encaminhe o veículo para diagnóstico técnico.",
    urgency: "medium",
  },
  {
    keywords: ["suspensao", "suspensão", "amortecedor", "batida", "pulo", "rolamento", "balaço", "balanço"],
    problem: "Problema na suspensão / amortecedores",
    solution:
      "Verifique se há vazamento de óleo nos amortecedores, desgaste nas buchas ou coxins. Ruídos de pancada seca ao passar em buracos indicam a necessidade de substituição imediata.",
    causes:
      "Amortecedores desgastados, buchas soltas ou molas empenadas podem comprometer a estabilidade.",
    advice:
      "Agende revisão de suspensão e não use o veículo com ruídos persistentes.",
    urgency: "medium",
  },
  {
    keywords: ["ar condicionado", "ar-condicionado", "frio", "ventilador", "ventilação", "ventilacao", "gelando"],
    problem: "Falha no ar condicionado",
    solution:
      "Se o ar não está gelando, verifique o filtro de cabine (pode estar obstruído) ou se há vazamento do gás refrigerante. Se a ventilação não liga, pode ser fusível queimado ou defeito no motor soprador.",
    causes:
      "Filtro sujo, gás refrigerante baixo ou problema elétrico no ventilador podem prejudicar o ar-condicionado.",
    advice:
      "Verifique o filtro e as conexões elétricas antes de procurar por recarga de gás.",
    urgency: "low",
  },
  {
    keywords: ["embreagem", "embreagem dura", "marcha", "cambio", "câmbio", "pedal embreagem", "tranco"],
    problem: "Desgaste no sistema de embreagem",
    solution:
      "Pedal muito duro, trepidação ao arrancar ou dificuldade para engatar marchas são sinais claros de desgaste do disco e platô de embreagem. Agende a substituição do kit completo de embreagem para evitar ficar parado na via.",
    causes:
      "Disco cruzado, platô ou rolamento danificado podem causar travamento e desgaste prematuro.",
    advice:
      "Evite forçar a embreagem e encaminhe para substituição completa em oficina especializada.",
    urgency: "high",
  },
  {
    keywords: ["farol", "farol queimado", "lanterna", "pisca", "luzes", "iluminação", "faróis", "sinal"],
    problem: "Falha de iluminação / farol queimado",
    solution:
      "Verifique as lâmpadas do farol, lanternas e setas. Substitua lâmpadas queimadas imediatamente. Se nenhuma acender, verifique o fusível correspondente ou o relé de acionamento.",
    causes:
      "Lâmpadas queimadas, fusível aberto ou conexões soltas podem causar falhas de iluminação.",
    advice:
      "Substitua a lâmpada e teste o circuito antes de retomar a operação noturna.",
    urgency: "medium",
  },
  {
    keywords: ["correia", "correia dentada", "chiado", "barulho agudo", "correias", "alternador", "tensor"],
    problem: "Desgaste ou ruído na correia",
    solution:
      "Ruídos agudos (chiados) ao ligar o carro ou esterçar indicam correia de acessórios frouxa ou gasta. Verifique também a correia dentada, cuja ruptura causa danos graves ao motor. Substitua conforme quilometragem especificada.",
    causes:
      "Correias envelhecidas, tensionador solto ou polias travadas podem gerar ruído e falha.",
    advice:
      "Substitua a correia de acessórios e avalie o estado do tensionador preventivamente.",
    urgency: "high",
  },
  {
    keywords: ["direção", "volante", "puxa", "alinhamento", "estabilidade", "traseira"],
    problem: "Problema na direção ou alinhamento",
    solution:
      "Carro puxando para um lado ou volante desalinhado pode indicar pressão incorreta nos pneus, alinhamento fora do padrão ou folga em componentes da direção.",
    causes:
      "Pneus murchos, desgaste irregular ou folgas em terminais e barras podem afetar a direção.",
    advice:
      "Faça alinhamento e balanceamento, e troque componentes com folga para manter o controle do veículo.",
    urgency: "medium",
  },
  {
    keywords: ["vibração", "trepidação", "volante", "rolamento", "balanceamento", "bomba"],
    problem: "Vibração ao rodar ou frear",
    solution:
      "Vibração no volante pode ser causada por balanceamento impróprio, discos empenados ou rolamentos desgastados. Inspecione rodas e freios.",
    causes:
      "Balanceamento ruim, discos deformados ou rolamento da roda comprometido.",
    advice:
      "Leve para revisão de rodas e freios antes de continuar operação em rotações altas.",
    urgency: "medium",
  },
  {
    keywords: ["motor", "falha", "engasga", "gagueja", "fumaça", "injeção", "mistura", "potência"],
    problem: "Falha de motor ou injeção",
    solution:
      "Verifique filtros, velas, bobinas, injetores e sensores de oxigênio. Falhas intermitentes podem ser causadas por mistura pobre ou mau funcionamento elétrico.",
    causes:
      "Filtro sujo, vela gasta, sensor ruim ou injetor com vazamento.",
    advice:
      "Realize manutenção de motor e use scanner para identificar códigos de falha antes de rodar novamente.",
    urgency: "medium",
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
    const urgencyLabel = match.urgency === "high" ? "Alta" : match.urgency === "medium" ? "Média" : "Baixa";
    const causes = match.causes ? `**Possíveis causas:** ${match.causes}\n\n` : "";
    const advice = match.advice ? `**Próximo(s) passo(s):** ${match.advice}\n\n` : "";

    return `**${match.problem}**\n\n${causes}**Solução recomendada:** ${match.solution}\n\n${advice}_Urgência: ${urgencyLabel}_`;
  }
  return (
    "Descreva sintomas com mais detalhes (barulhos, luzes do painel, vazamentos, vibrando ou puxando). " +
    "Posso ajudar com: óleo, freios, pneus, bateria, aquecimento, consumo, suspensão, ar-condicionado, embreagem, faróis, correias, direção ou motor."
  );
}
