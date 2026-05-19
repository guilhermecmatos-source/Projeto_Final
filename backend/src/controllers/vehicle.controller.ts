import { Request, Response } from "express";
import { vehicleService } from "../services/vehicle.service";
import { sendError } from "../utils/errors";

export class VehicleController {
  async list(_req: Request, res: Response) {
    const vehicles = await vehicleService.findAll();
    return res.json(vehicles);
  }

  async get(req: Request, res: Response) {
    const vehicle = await vehicleService.findById(req.params.id);
    if (!vehicle) return sendError(res, 404, "Vehicle not found");
    return res.json(vehicle);
  }

  async create(req: Request, res: Response) {
    const { plate, brand, model, year, status, mileage } = req.body;
    if (!plate || !brand || !model || !year) {
      return sendError(res, 400, "plate, brand, model and year are required");
    }
    const vehicle = await vehicleService.create({ plate, brand, model, year, status, mileage });
    return res.status(201).json(vehicle);
  }

  async update(req: Request, res: Response) {
    const vehicle = await vehicleService.update(req.params.id, req.body);
    if (!vehicle) return sendError(res, 404, "Vehicle not found");
    return res.json(vehicle);
  }

  async delete(req: Request, res: Response) {
    const deleted = await vehicleService.delete(req.params.id);
    if (!deleted) return sendError(res, 404, "Vehicle not found");
    return res.status(204).send();
  }
}

export const vehicleController = new VehicleController();
