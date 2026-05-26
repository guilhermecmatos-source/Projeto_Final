import { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";
import { sendError } from "../utils/errors";

export class DashboardController {
  async index(req: Request, res: Response) {
    try {
      const dateFrom = req.query.dateFrom ? String(req.query.dateFrom) : undefined;
      const dateTo = req.query.dateTo ? String(req.query.dateTo) : undefined;
      const [kpis, alerts, vehicles, forecast] = await Promise.all([
        dashboardService.getKpis(dateFrom, dateTo),
        dashboardService.getAlerts(),
        dashboardService.getRecentVehicles(),
        dashboardService.getDemandForecast(),
      ]);
      return res.json({ kpis, alerts, vehicles, forecast, dateRange: { dateFrom, dateTo } });
    } catch (err) {
      console.error("[dashboard]", err);
      return sendError(res, 500, "Erro ao carregar dashboard");
    }
  }
}

export const dashboardController = new DashboardController();
