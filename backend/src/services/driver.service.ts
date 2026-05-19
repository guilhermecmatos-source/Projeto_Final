import { query } from "../database/connection";
import { Driver } from "../models/types";
import { predictiveService } from "../ai/predictive.service";

export class DriverService {
  async findAll() {
    return query<Driver>("SELECT * FROM drivers ORDER BY name");
  }

  async findById(id: string) {
    const rows = await query<Driver>("SELECT * FROM drivers WHERE id = $1", [id]);
    return rows[0] || null;
  }

  async create(data: { name: string; license_number: string; phone?: string }) {
    const rows = await query<Driver>(
      `INSERT INTO drivers (name, license_number, phone)
       VALUES ($1, $2, $3) RETURNING *`,
      [data.name, data.license_number, data.phone || null]
    );
    return rows[0];
  }

  async update(id: string, data: Partial<Driver>) {
    const rows = await query<Driver>(
      `UPDATE drivers SET
        name = COALESCE($2, name),
        license_number = COALESCE($3, license_number),
        phone = COALESCE($4, phone),
        active = COALESCE($5, active),
        updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id, data.name, data.license_number, data.phone, data.active]
    );
    if (rows[0]) {
      const score = await predictiveService.calculateDriverScore(id);
      await query("UPDATE drivers SET score = $2 WHERE id = $1", [id, score]);
      rows[0].score = score;
    }
    return rows[0] || null;
  }

  async delete(id: string) {
    const rows = await query("DELETE FROM drivers WHERE id = $1 RETURNING id", [id]);
    return rows.length > 0;
  }

  async refreshScore(id: string) {
    const score = await predictiveService.calculateDriverScore(id);
    await query("UPDATE drivers SET score = $2, updated_at = NOW() WHERE id = $1", [id, score]);
    return score;
  }
}

export const driverService = new DriverService();
