import { Request, Response } from "express";
import { ruvService } from "../services/ruv.service";
import { auditService } from "../services/audit.service";
import { sendError } from "../utils/errors";

export class RuvController {
  async list(req: Request, res: Response) {
    const status = req.query.status as string | undefined;
    return res.json(await ruvService.findAll(status));
  }

  async get(req: Request, res: Response) {
    const item = await ruvService.findById(req.params.id);
    if (!item) return sendError(res, 404, "Solicitação não encontrada");
    return res.json(item);
  }

  async create(req: Request, res: Response) {
    try {
      const item = await ruvService.create({
        requester_id: req.user!.userId,
        origin: req.body.origin,
        destination: req.body.destination,
        purpose: req.body.purpose,
        passengers: req.body.passengers,
      });
      await auditService.log({
        entityType: "ruv_request",
        entityId: item.id,
        action: "create",
        userId: req.user?.userId,
        userEmail: req.user?.email,
      });
      return res.status(201).json(item);
    } catch (e) {
      return sendError(res, 400, e instanceof Error ? e.message : "Erro ao criar solicitação");
    }
  }

  async approve(req: Request, res: Response) {
    const item = await ruvService.approve(
      req.params.id,
      req.user!.userId,
      req.body.justification
    );
    if (!item) return sendError(res, 404, "Solicitação não encontrada");
    await auditService.log({
      entityType: "ruv_request",
      entityId: item.id,
      action: "update",
      userId: req.user?.userId,
      userEmail: req.user?.email,
      details: "aprovado",
    });
    return res.json(item);
  }

  async reject(req: Request, res: Response) {
    try {
      const item = await ruvService.reject(
        req.params.id,
        req.user!.userId,
        req.body.justification
      );
      if (!item) return sendError(res, 404, "Solicitação não encontrada");
      await auditService.log({
        entityType: "ruv_request",
        entityId: item.id,
        action: "update",
        userId: req.user?.userId,
        userEmail: req.user?.email,
        details: "rejeitado",
      });
      return res.json(item);
    } catch (e) {
      return sendError(res, 400, e instanceof Error ? e.message : "Erro");
    }
  }
}

export const ruvController = new RuvController();
