import { query } from "../database/connection";
import { Travel, TravelStatus } from "../models/types";
import { vehicleService } from "./vehicle.service";
import { driverService } from "./driver.service";

export class TravelService {
  async findAll(search?: string) {
    let sql = `SELECT t.*, v.plate as vehicle_plate, d.name as driver_name
       FROM travels t
       LEFT JOIN vehicles v ON v.id = t.vehicle_id
       LEFT JOIN drivers d ON d.id = t.driver_id`;
    const params: string[] = [];
    if (search?.trim()) {
      sql += ` WHERE t.origin LIKE ? OR t.destination LIKE ? OR v.plate LIKE ? OR d.name LIKE ?`;
      const q = `%${search.trim()}%`;
      params.push(q, q, q, q);
    }
    sql += " ORDER BY t.created_at DESC";
    return query<Travel>(sql, params.length ? params : undefined);
  }

  async findById(id: string) {
    const rows = await query<Travel>(
      `SELECT t.*, v.plate as vehicle_plate, d.name as driver_name
       FROM travels t
       LEFT JOIN vehicles v ON v.id = t.vehicle_id
       LEFT JOIN drivers d ON d.id = t.driver_id
       WHERE t.id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async validateRefs(vehicleId: string, driverId: string) {
    const vehicle = await vehicleService.findById(vehicleId);
    if (!vehicle) throw new Error("Veículo não encontrado.");
    const driver = await driverService.findById(driverId);
    if (!driver) throw new Error("Motorista não encontrado.");
    return { vehicle, driver };
  }

  async create(data: {
    vehicle_id: string;
    driver_id: string;
    origin: string;
    destination: string;
    distance_km?: number;
    fuel_consumption?: number;
    km_start?: number;
    km_end?: number;
    estimated_duration_min?: number;
    cost?: number;
    checklist_departure?: Record<string, unknown>;
    checklist_arrival?: Record<string, unknown>;
  }) {
    if (!data.origin?.trim() || !data.destination?.trim()) {
      throw new Error("Origem e destino são obrigatórios.");
    }
    await this.validateRefs(data.vehicle_id, data.driver_id);

    const rows = await query<Travel>(
      `INSERT INTO travels (vehicle_id, driver_id, origin, destination, distance_km, fuel_consumption, status, km_start, km_end, estimated_duration_min, cost, checklist_departure, checklist_arrival)
       VALUES ($1, $2, $3, $4, $5, $6, 'scheduled', $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        data.vehicle_id,
        data.driver_id,
        data.origin.trim(),
        data.destination.trim(),
        data.distance_km || 0,
        data.fuel_consumption || 0,
        data.km_start ?? null,
        data.km_end ?? null,
        data.estimated_duration_min ?? null,
        data.cost ?? 0,
        data.checklist_departure ? JSON.stringify(data.checklist_departure) : null,
        data.checklist_arrival ? JSON.stringify(data.checklist_arrival) : null,
      ]
    );
    return this.findById(rows[0].id);
  }

  async update(id: string, data: Partial<Travel> & { vehicle_id?: string; driver_id?: string }) {
    const current = await this.findById(id);
    if (!current) return null;

    const vehicleId = data.vehicle_id ?? current.vehicle_id;
    const driverId = data.driver_id ?? current.driver_id;
    if (vehicleId && driverId) await this.validateRefs(vehicleId, driverId);

    await query<Travel>(
      `UPDATE travels SET
        vehicle_id = COALESCE($2, vehicle_id),
        driver_id = COALESCE($3, driver_id),
        origin = COALESCE($4, origin),
        destination = COALESCE($5, destination),
        distance_km = COALESCE($6, distance_km),
        fuel_consumption = COALESCE($7, fuel_consumption),
        status = COALESCE($8, status),
        km_start = COALESCE($9, km_start),
        km_end = COALESCE($10, km_end),
        estimated_duration_min = COALESCE($11, estimated_duration_min),
        cost = COALESCE($12, cost),
        checklist_departure = COALESCE($13, checklist_departure),
        checklist_arrival = COALESCE($14, checklist_arrival)
       WHERE id = $1`,
      [
        id,
        data.vehicle_id,
        data.driver_id,
        data.origin,
        data.destination,
        data.distance_km,
        data.fuel_consumption,
        data.status,
        data.km_start,
        data.km_end,
        data.estimated_duration_min,
        data.cost,
        data.checklist_departure ? JSON.stringify(data.checklist_departure) : undefined,
        data.checklist_arrival ? JSON.stringify(data.checklist_arrival) : undefined,
      ]
    );
    return this.findById(id);
  }

  async delete(id: string) {
    const rows = await query("DELETE FROM travels WHERE id = $1 RETURNING id", [id]);
    return rows.length > 0;
  }

  async cancel(id: string) {
    const rows = await query<Travel>(
      `UPDATE travels SET status = 'cancelled' WHERE id = $1 AND status != 'completed' RETURNING *`,
      [id]
    );
    return rows[0] || null;
  }

  async updateStatus(id: string, status: TravelStatus) {
    return this.update(id, { status });
  }
}

export const travelService = new TravelService();
