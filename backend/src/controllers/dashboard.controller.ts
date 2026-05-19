import { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";

export class DashboardController {
  async index(_req: Request, res: Response) {
    const [kpis, alerts, vehicles, forecast] = await Promise.all([
      dashboardService.getKpis(),
      dashboardService.getAlerts(),
      dashboardService.getRecentVehicles(),
      dashboardService.getDemandForecast(),
    ]);
    return res.json({ kpis, alerts, vehicles, forecast });
  }
}

export const dashboardController = new DashboardController();
