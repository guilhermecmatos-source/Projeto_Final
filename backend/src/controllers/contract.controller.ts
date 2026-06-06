import { Request, Response } from "express";
import { contractService } from "../services/contract.service";
import { sendError } from "../utils/errors";

export class ContractController {
  async list(_req: Request, res: Response) {
    return res.json(await contractService.findAll());
  }

  async get(req: Request, res: Response) {
    const contract = await contractService.findById(req.params.id);
    if (!contract) return sendError(res, 404, "Contrato não encontrado");
    return res.json(contract);
  }

  async templates(req: Request, res: Response) {
    const area = req.query.area as string | undefined;
    return res.json(contractService.getTemplates(area));
  }

  async preview(req: Request, res: Response) {
    const { template_key, client_name } = req.body;
    if (!template_key || !client_name) {
      return sendError(res, 400, "template_key e client_name são obrigatórios");
    }
    return res.json(contractService.preview(req.body));
  }

  async create(req: Request, res: Response) {
    try {
      const { title, area, template_key, client_name, content } = req.body;
      if (!title || !area || !template_key || !client_name || !content) {
        return sendError(res, 400, "Campos obrigatórios ausentes");
      }
      const contract = await contractService.create({
        ...req.body,
        created_by: req.user?.id,
      });
      return res.status(201).json(contract);
    } catch (e) {
      return sendError(res, 400, e instanceof Error ? e.message : "Erro ao criar contrato");
    }
  }

  async update(req: Request, res: Response) {
    const contract = await contractService.update(req.params.id, req.body);
    if (!contract) return sendError(res, 404, "Contrato não encontrado");
    return res.json(contract);
  }

  async send(req: Request, res: Response) {
    const contract = await contractService.send(req.params.id);
    if (!contract) return sendError(res, 404, "Contrato não encontrado");
    return res.json(contract);
  }

  async sign(req: Request, res: Response) {
    const contract = await contractService.sign(req.params.id);
    if (!contract) return sendError(res, 404, "Contrato não encontrado");
    return res.json(contract);
  }

  async cancel(req: Request, res: Response) {
    const contract = await contractService.cancel(req.params.id);
    if (!contract) return sendError(res, 404, "Contrato não encontrado");
    return res.json(contract);
  }
}

export const contractController = new ContractController();
