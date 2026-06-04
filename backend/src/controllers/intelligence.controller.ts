import { Request, Response } from "express";
import { intelligenceService } from "../services/intelligence.service";

export class IntelligenceController {
  async metrics(_req: Request, res: Response) {
    return res.json(await intelligenceService.getMetrics());
  }

  async discovery(_req: Request, res: Response) {
    return res.json(await intelligenceService.getDiscovery());
  }

  async ceo(_req: Request, res: Response) {
    return res.json(await intelligenceService.getCeoInsights());
  }

  async travels(_req: Request, res: Response) {
    return res.json(await intelligenceService.getRecentTravels(15));
  }
}

export const intelligenceController = new IntelligenceController();
