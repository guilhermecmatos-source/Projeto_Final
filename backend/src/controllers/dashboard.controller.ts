import { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";
import { sendError } from "../utils/errors";

export class DashboardController {
  async index(_req: Request, res: Response) {
    try {
      const [kpis, alerts, vehicles, forecast] = await Promise.all([
        dashboardService.getKpis(),
        dashboardService.getAlerts(),
        dashboardService.getRecentVehicles(),
        dashboardService.getDemandForecast(),
      ]);
      return res.json({ kpis, alerts, vehicles, forecast });
    } catch (err) {
      console.error("[dashboard]", err);
      return sendError(res, 500, "Erro ao carregar dashboard");
    }
  }
}

export const dashboardController = new DashboardController();
