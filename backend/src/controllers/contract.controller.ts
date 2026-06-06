import { Request, Response } from "express";
import { contractService } from "../services/contract.service";
import {
  CONTRACT_TEMPLATES,
  getDefaultTemplateForArea,
  getTemplatesByArea,
  renderContractContent,
} from "../lib/contract-templates";
import { sendError } from "../utils/errors";

export class ContractController {
  async list(_req: Request, res: Response) {
    const contracts = await contractService.findAll();
    await contractService.sendReminders();
    return res.json({ contracts, templates: CONTRACT_TEMPLATES });
  }

  async get(req: Request, res: Response) {
    const contract = await contractService.findById(req.params.id);
    if (!contract) return sendError(res, 404, "Contrato não encontrado");
    const notifications = await contractService.getNotifications(req.params.id);
    return res.json({ contract, notifications });
  }

  async templates(req: Request, res: Response) {
    const area = req.query.area as string | undefined;
    if (area === "trabalhista" || area === "previdenciario") {
      return res.json({
        templates: getTemplatesByArea(area),
        defaultKey: getDefaultTemplateForArea(area),
      });
    }
    return res.json({ templates: CONTRACT_TEMPLATES });
  }

  async preview(req: Request, res: Response) {
    const { template_key, client_name, client_cpf, client_email, honorarios } = req.body;
    if (!template_key || !client_name) {
      return sendError(res, 400, "template_key e client_name são obrigatórios");
    }
    const content = renderContractContent(template_key, {
      clientName: client_name,
      clientCpf: client_cpf,
      clientEmail: client_email,
      honorarios: Number(honorarios) || 0,
    });
    return res.json({ content });
  }

  async create(req: Request, res: Response) {
    try {
      const contract = await contractService.create({
        ...req.body,
        created_by: req.user?.userId,
      });
      return res.status(201).json(contract);
    } catch (e) {
      return sendError(res, 400, e instanceof Error ? e.message : "Erro ao criar contrato");
    }
  }

  async update(req: Request, res: Response) {
    try {
      const contract = await contractService.update(req.params.id, req.body);
      if (!contract) return sendError(res, 404, "Contrato não encontrado");
      return res.json(contract);
    } catch (e) {
      return sendError(res, 400, e instanceof Error ? e.message : "Erro ao atualizar");
    }
  }

  async send(req: Request, res: Response) {
    try {
      const contract = await contractService.sendForSignature(req.params.id);
      if (!contract) return sendError(res, 404, "Contrato não encontrado");
      return res.json(contract);
    } catch (e) {
      return sendError(res, 400, e instanceof Error ? e.message : "Erro ao enviar");
    }
  }

  async sign(req: Request, res: Response) {
    const contract = await contractService.markSigned(req.params.id);
    if (!contract) return sendError(res, 404, "Contrato não encontrado ou não enviado");
    return res.json(contract);
  }

  async cancel(req: Request, res: Response) {
    const contract = await contractService.cancel(req.params.id);
    if (!contract) return sendError(res, 404, "Contrato não encontrado");
    return res.json(contract);
  }
}

export const contractController = new ContractController();
