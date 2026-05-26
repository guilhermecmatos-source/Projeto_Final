import { Request, Response } from "express";
import { resolveRouteDistance } from "../services/geocoding.service";
import { sendError } from "../utils/errors";

export class GeocodingController {
  async distance(req: Request, res: Response) {
    const origin = String(req.query.origin || "");
    const destination = String(req.query.destination || "");
    if (!origin || !destination) {
      return sendError(res, 400, "origin and destination are required");
    }
    try {
      const result = await resolveRouteDistance(origin, destination);
      return res.json(result);
    } catch (err) {
      console.error("[geocoding]", err);
      return sendError(res, 500, "Erro ao calcular distância");
    }
  }
}

export const geocodingController = new GeocodingController();
