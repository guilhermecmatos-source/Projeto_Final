import { query } from "../database/connection";
import {
  ContractArea,
  ContractTemplateKey,
  getDefaultTemplateForArea,
  renderContractContent,
} from "../lib/contract-templates";

export type ContractStatus = "rascunho" | "enviado" | "assinado" | "cancelado";

export interface Contract {
  id: string;
  title: string;
  area: ContractArea;
  template_key: ContractTemplateKey;
  client_name: string;
  client_email?: string | null;
  client_cpf?: string | null;
  content: string;
  honorarios: number;
  status: ContractStatus;
  signature_step: number;
  sent_at?: string | null;
  signed_at?: string | null;
  cancelled_at?: string | null;
  notification_sent?: boolean;
  reminder_sent?: boolean;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

const STATUS_LABEL: Record<ContractStatus, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado para assinatura",
  assinado: "Assinado",
  cancelado: "Cancelado",
};

export class ContractService {
  async findAll() {
    return query<Contract>(
      "SELECT * FROM contracts ORDER BY updated_at DESC, created_at DESC"
    );
  }

  async findById(id: string) {
    const rows = await query<Contract>("SELECT * FROM contracts WHERE id = $1", [id]);
    return rows[0] || null;
  }

  async getNotifications(contractId: string) {
    return query<{ id: string; channel: string; message: string; sent_at: string }>(
      "SELECT * FROM contract_notifications WHERE contract_id = $1 ORDER BY sent_at DESC",
      [contractId]
    );
  }

  async create(data: {
    title: string;
    area: ContractArea;
    template_key?: ContractTemplateKey;
    client_name: string;
    client_email?: string;
    client_cpf?: string;
    honorarios?: number;
    content?: string;
    created_by?: string;
  }) {
    const templateKey = data.template_key || getDefaultTemplateForArea(data.area);
    const content =
      data.content ||
      renderContractContent(templateKey, {
        clientName: data.client_name,
        clientCpf: data.client_cpf,
        clientEmail: data.client_email,
        honorarios: data.honorarios,
      });

    const rows = await query<Contract>(
      `INSERT INTO contracts (title, area, template_key, client_name, client_email, client_cpf, content, honorarios, status, signature_step, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'rascunho', 1, $9) RETURNING *`,
      [
        data.title.trim(),
        data.area,
        templateKey,
        data.client_name.trim(),
        data.client_email?.trim() || null,
        data.client_cpf?.replace(/\D/g, "") || null,
        content,
        data.honorarios ?? 0,
        data.created_by || null,
      ]
    );
    return rows[0];
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      client_name: string;
      client_email: string;
      client_cpf: string;
      content: string;
      honorarios: number;
      template_key: ContractTemplateKey;
      area: ContractArea;
    }>
  ) {
    const current = await this.findById(id);
    if (!current) return null;
    if (current.status === "assinado" || current.status === "cancelado") {
      throw new Error("Contrato assinado ou cancelado não pode ser editado.");
    }

    const rows = await query<Contract>(
      `UPDATE contracts SET
        title = COALESCE($2, title),
        client_name = COALESCE($3, client_name),
        client_email = COALESCE($4, client_email),
        client_cpf = COALESCE($5, client_cpf),
        content = COALESCE($6, content),
        honorarios = COALESCE($7, honorarios),
        template_key = COALESCE($8, template_key),
        area = COALESCE($9, area),
        updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [
        id,
        data.title,
        data.client_name,
        data.client_email,
        data.client_cpf ? data.client_cpf.replace(/\D/g, "") : undefined,
        data.content,
        data.honorarios,
        data.template_key,
        data.area,
      ]
    );
    return rows[0] || null;
  }

  async sendForSignature(id: string) {
    const contract = await this.findById(id);
    if (!contract) return null;
    if (contract.status !== "rascunho") {
      throw new Error("Somente contratos em rascunho podem ser enviados.");
    }

    const rows = await query<Contract>(
      `UPDATE contracts SET status = 'enviado', signature_step = 3, sent_at = NOW(),
       notification_sent = 1, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );

    const msg = `Contrato "${contract.title}" enviado para assinatura digital. Cliente: ${contract.client_name}. Acesse o link de assinatura para concluir.`;
    await query(
      `INSERT INTO contract_notifications (contract_id, channel, message) VALUES ($1, 'sistema', $2)`,
      [id, msg]
    );
    if (contract.client_email) {
      await query(
        `INSERT INTO contract_notifications (contract_id, channel, message) VALUES ($1, 'email', $2)`,
        [
          id,
          `E-mail enviado para ${contract.client_email}: ${contract.title} aguarda sua assinatura digital.`,
        ]
      );
    }
    return rows[0] || null;
  }

  async markSigned(id: string) {
    const rows = await query<Contract>(
      `UPDATE contracts SET status = 'assinado', signature_step = 4, signed_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND status = 'enviado' RETURNING *`,
      [id]
    );
    return rows[0] || null;
  }

  async cancel(id: string) {
    const rows = await query<Contract>(
      `UPDATE contracts SET status = 'cancelado', cancelled_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND status != 'assinado' RETURNING *`,
      [id]
    );
    return rows[0] || null;
  }

  async sendReminders() {
    const pending = await query<Contract>(
      `SELECT * FROM contracts WHERE status = 'enviado' AND reminder_sent = 0
       AND sent_at <= DATE_SUB(NOW(), INTERVAL 3 DAY)`
    );
    for (const c of pending) {
      await query(
        `INSERT INTO contract_notifications (contract_id, channel, message) VALUES ($1, 'lembrete', $2)`,
        [
          c.id,
          `Lembrete: contrato "${c.title}" aguarda assinatura de ${c.client_name} há mais de 3 dias.`,
        ]
      );
      await query("UPDATE contracts SET reminder_sent = 1 WHERE id = $1", [c.id]);
    }
    return pending.length;
  }

  getStatusLabel(status: ContractStatus) {
    return STATUS_LABEL[status] || status;
  }
}

export const contractService = new ContractService();
