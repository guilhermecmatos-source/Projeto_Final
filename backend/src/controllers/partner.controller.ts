import { Request, Response } from "express";
import { partnerService } from "../services/partner.service";
import { sendError } from "../utils/errors";

export class PartnerController {
  async list(_req: Request, res: Response) {
    const [partners, stats, tickets] = await Promise.all([
      partnerService.findAll(),
      partnerService.getStats(),
      partnerService.findTickets(),
    ]);
    return res.json({ partners, stats, tickets });
  }

  async create(req: Request, res: Response) {
    try {
      const partner = await partnerService.create(req.body);
      return res.status(201).json(partner);
    } catch (e) {
      return sendError(res, 400, e instanceof Error ? e.message : "Erro ao cadastrar parceiro");
    }
  }

  async createTicket(req: Request, res: Response) {
    try {
      const ticket = await partnerService.createTicket(req.body);
      return res.status(201).json(ticket);
    } catch (e) {
      return sendError(res, 400, e instanceof Error ? e.message : "Erro ao abrir chamado");
    }
  }
}

export const partnerController = new PartnerController();
