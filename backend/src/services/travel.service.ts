import { query } from "../database/connection";
import { Travel, TravelStatus } from "../models/types";

export class TravelService {
  async findAll() {
    return query<Travel>(
      `SELECT t.*, v.plate as vehicle_plate, d.name as driver_name
       FROM travels t
       LEFT JOIN vehicles v ON v.id = t.vehicle_id
       LEFT JOIN drivers d ON d.id = t.driver_id
       ORDER BY t.created_at DESC`
    );
  }

  async findById(id: string) {
    const rows = await query<Travel>("SELECT * FROM travels WHERE id = $1", [id]);
    return rows[0] || null;
  }

  async create(data: {
    vehicle_id: string;
    driver_id: string;
    origin: string;
    destination: string;
    distance_km?: number;
    fuel_consumption?: number;
  }) {
    const rows = await query<Travel>(
      `INSERT INTO travels (vehicle_id, driver_id, origin, destination, distance_km, fuel_consumption, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'scheduled') RETURNING *`,
      [data.vehicle_id, data.driver_id, data.origin, data.destination, data.distance_km || 0, data.fuel_consumption || 0]
    );
    return rows[0];
  }

  async update(id: string, data: Partial<Travel>) {
    const rows = await query<Travel>(
      `UPDATE travels SET
        origin = COALESCE($2, origin),
        destination = COALESCE($3, destination),
        distance_km = COALESCE($4, distance_km),
        fuel_consumption = COALESCE($5, fuel_consumption),
        status = COALESCE($6, status)
       WHERE id = $1 RETURNING *`,
      [id, data.origin, data.destination, data.distance_km, data.fuel_consumption, data.status]
    );
    return rows[0] || null;
  }

  async cancel(id: string) {
    const rows = await query<Travel>(
      `UPDATE travels SET status = 'cancelled' WHERE id = $1 AND status != 'completed' RETURNING *`,
      [id]
    );
    return rows[0] || null;
  }
}

export const travelService = new TravelService();
