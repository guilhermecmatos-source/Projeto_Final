import { query } from "../database/connection";
import { Vehicle, VehicleStatus } from "../models/types";

export class VehicleService {
  async findAll() {
    return query<Vehicle>("SELECT * FROM vehicles ORDER BY created_at DESC");
  }

  async findById(id: string) {
    const rows = await query<Vehicle>("SELECT * FROM vehicles WHERE id = $1", [id]);
    return rows[0] || null;
  }

  async create(data: {
    plate: string;
    brand: string;
    model: string;
    year: number;
    status?: VehicleStatus;
    mileage?: number;
  }) {
    const rows = await query<Vehicle>(
      `INSERT INTO vehicles (plate, brand, model, year, status, mileage)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [data.plate, data.brand, data.model, data.year, data.status || "active", data.mileage || 0]
    );
    return rows[0];
  }

  async update(id: string, data: Partial<Vehicle>) {
    const rows = await query<Vehicle>(
      `UPDATE vehicles SET
        plate = COALESCE($2, plate),
        brand = COALESCE($3, brand),
        model = COALESCE($4, model),
        year = COALESCE($5, year),
        status = COALESCE($6, status),
        mileage = COALESCE($7, mileage),
        updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id, data.plate, data.brand, data.model, data.year, data.status, data.mileage]
    );
    return rows[0] || null;
  }

  async delete(id: string) {
    const rows = await query("DELETE FROM vehicles WHERE id = $1 RETURNING id", [id]);
    return rows.length > 0;
  }
}

export const vehicleService = new VehicleService();
