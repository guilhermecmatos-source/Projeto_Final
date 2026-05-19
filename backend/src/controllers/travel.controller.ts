import { Request, Response } from "express";
import { travelService } from "../services/travel.service";
import { sendError } from "../utils/errors";

export class TravelController {
  async list(_req: Request, res: Response) {
    return res.json(await travelService.findAll());
  }

  async get(req: Request, res: Response) {
    const travel = await travelService.findById(req.params.id);
    if (!travel) return sendError(res, 404, "Travel not found");
    return res.json(travel);
  }

  async create(req: Request, res: Response) {
    const { vehicle_id, driver_id, origin, destination, distance_km, fuel_consumption } = req.body;
    if (!vehicle_id || !driver_id || !origin || !destination) {
      return sendError(res, 400, "vehicle_id, driver_id, origin and destination are required");
    }
    const travel = await travelService.create({
      vehicle_id, driver_id, origin, destination, distance_km, fuel_consumption,
    });
    return res.status(201).json(travel);
  }

  async update(req: Request, res: Response) {
    const travel = await travelService.update(req.params.id, req.body);
    if (!travel) return sendError(res, 404, "Travel not found");
    return res.json(travel);
  }

  async cancel(req: Request, res: Response) {
    const travel = await travelService.cancel(req.params.id);
    if (!travel) return sendError(res, 404, "Travel not found or already completed");
    return res.json(travel);
  }
}

export const travelController = new TravelController();
