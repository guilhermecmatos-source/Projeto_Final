import { query } from "../database/connection";
import { predictiveService } from "../ai/predictive.service";

export class DashboardService {
  async getKpis() {
    const [vehicles, drivers, travels, fuel, maintenance] = await Promise.all([
      query<{ total: string; active: string }>(
        `SELECT CAST(COUNT(*) AS CHAR) as total,
         CAST(SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS CHAR) as active FROM vehicles`
      ),
      query<{ total: string }>("SELECT CAST(COUNT(*) AS CHAR) as total FROM drivers WHERE active = 1"),
      query<{ total: string; completed: string }>(
        `SELECT CAST(COUNT(*) AS CHAR) as total,
         CAST(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS CHAR) as completed FROM travels`
      ),
      query<{ total_cost: string }>(
        "SELECT CAST(COALESCE(SUM(cost), 0) AS CHAR) as total_cost FROM fuel_records"
      ),
      query<{ pending: string }>(
        `SELECT CAST(COUNT(*) AS CHAR) as pending FROM maintenances
         WHERE completed_at IS NULL AND scheduled_at <= DATE_ADD(NOW(), INTERVAL 30 DAY)`
      ),
    ]);

    return {
      vehicles: { total: parseInt(vehicles[0].total), active: parseInt(vehicles[0].active) },
      drivers: parseInt(drivers[0].total),
      travels: { total: parseInt(travels[0].total), completed: parseInt(travels[0].completed) },
      fuelCost: parseFloat(fuel[0].total_cost),
      pendingMaintenance: parseInt(maintenance[0].pending),
    };
  }

  async getAlerts() {
    return predictiveService.generateAllAlerts();
  }

  async getRecentVehicles(limit = 5) {
    const parsedLimit = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 5));
    return query(
      `SELECT id, plate, brand, model, status, mileage FROM vehicles ORDER BY updated_at DESC LIMIT ${parsedLimit}`
    );
  }

  async getDemandForecast() {
    return predictiveService.predictLogisticsDemand();
  }
}

export const dashboardService = new DashboardService();
