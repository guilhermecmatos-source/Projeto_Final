import { query } from "../database/connection";
import { Maintenance, MaintenanceType } from "../models/types";
import { predictiveService } from "../ai/predictive.service";

export class MaintenanceService {
  async findAll() {
    return query<Maintenance & { vehicle_plate: string }>(
      `SELECT m.*, v.plate as vehicle_plate FROM maintenances m
       JOIN vehicles v ON v.id = m.vehicle_id
       ORDER BY m.scheduled_at DESC`
    );
  }

  async create(data: {
    vehicle_id: string;
    type: MaintenanceType;
    description: string;
    cost?: number;
    scheduled_at: string;
  }) {
    const rows = await query<Maintenance>(
      `INSERT INTO maintenances (vehicle_id, type, description, cost, scheduled_at)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.vehicle_id, data.type, data.description, data.cost || 0, data.scheduled_at]
    );

    if (data.type === "preventive") {
      await query(
        "UPDATE vehicles SET status = 'maintenance' WHERE id = $1",
        [data.vehicle_id]
      );
    }

    return rows[0];
  }

  async complete(id: string) {
    const rows = await query<Maintenance>(
      `UPDATE maintenances SET completed_at = NOW(), alert_sent = false
       WHERE id = $1 RETURNING *`,
      [id]
    );
    if (rows[0]) {
      await query(
        "UPDATE vehicles SET status = 'active', updated_at = NOW() WHERE id = $1",
        [rows[0].vehicle_id]
      );
    }
    return rows[0] || null;
  }

  async emitAlerts() {
    const alerts = await predictiveService.generateAllAlerts();
    const pending = await query<Maintenance>(
      `SELECT m.* FROM maintenances m
       WHERE m.type = 'preventive' AND m.completed_at IS NULL
       AND m.scheduled_at <= DATE_ADD(NOW(), INTERVAL 7 DAY)`
    );

    for (const m of pending) {
      await query("UPDATE maintenances SET alert_sent = true WHERE id = $1", [m.id]);
    }

    return { alerts, pendingMaintenance: pending.length };
  }
}

export const maintenanceService = new MaintenanceService();
