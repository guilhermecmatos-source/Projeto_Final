import { Request, Response } from "express";
import { driverService } from "../services/driver.service";
import { sendError } from "../utils/errors";

export class DriverController {
  async list(_req: Request, res: Response) {
    return res.json(await driverService.findAll());
  }

  async get(req: Request, res: Response) {
    const driver = await driverService.findById(req.params.id);
    if (!driver) return sendError(res, 404, "Driver not found");
    return res.json(driver);
  }

  async create(req: Request, res: Response) {
    const { name, license_number, phone } = req.body;
    if (!name || !license_number) return sendError(res, 400, "name and license_number are required");
    const driver = await driverService.create({ name, license_number, phone });
    return res.status(201).json(driver);
  }

  async update(req: Request, res: Response) {
    const driver = await driverService.update(req.params.id, req.body);
    if (!driver) return sendError(res, 404, "Driver not found");
    return res.json(driver);
  }

  async delete(req: Request, res: Response) {
    const deleted = await driverService.delete(req.params.id);
    if (!deleted) return sendError(res, 404, "Driver not found");
    return res.status(204).send();
  }

  async score(req: Request, res: Response) {
    const score = await driverService.refreshScore(req.params.id);
    return res.json({ driverId: req.params.id, score });
  }
}

export const driverController = new DriverController();
