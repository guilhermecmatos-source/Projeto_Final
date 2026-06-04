import { Request, Response } from "express";
import { reportsService } from "../services/reports.service";

export class ReportsController {
  async summary(req: Request, res: Response) {
    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo = req.query.dateTo as string | undefined;
    return res.json(await reportsService.getSummary(dateFrom, dateTo));
  }
}

export const reportsController = new ReportsController();
