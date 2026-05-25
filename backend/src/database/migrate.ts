import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { getDbName } from "./connection";

dotenv.config();

function getBaseConfig(): mysql.ConnectionOptions {
  const url = process.env.DATABASE_URL;

  if (url?.startsWith("mysql://")) {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 3306,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
    };
  }

  return {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  };
}

async function migrate() {
  const dbName = getDbName();
  const baseConfig = getBaseConfig();

  const bootstrap = await mysql.createConnection(baseConfig);
  await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await bootstrap.end();

  const conn = await mysql.createConnection({ ...baseConfig, database: dbName });

  try {
    await conn.beginTransaction();

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        CHECK (role IN ('admin', 'attendant', 'client'))
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        plate VARCHAR(20) UNIQUE NOT NULL,
        brand VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        year INT NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        mileage DECIMAL(12,2) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CHECK (status IN ('active', 'maintenance', 'inactive'))
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS drivers (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(255) NOT NULL,
        license_number VARCHAR(50) UNIQUE NOT NULL,
        phone VARCHAR(30),
        score DECIMAL(5,2) DEFAULT 100,
        active TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS travels (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        vehicle_id CHAR(36),
        driver_id CHAR(36),
        origin VARCHAR(255) NOT NULL,
        destination VARCHAR(255) NOT NULL,
        distance_km DECIMAL(10,2) DEFAULT 0,
        fuel_consumption DECIMAL(10,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'scheduled',
        started_at DATETIME NULL,
        ended_at DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
        FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS fuel_records (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        vehicle_id CHAR(36),
        liters DECIMAL(10,2) NOT NULL,
        cost DECIMAL(12,2) NOT NULL,
        mileage_at_fill DECIMAL(12,2) NOT NULL,
        station VARCHAR(255),
        filled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        suspicious TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS maintenances (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        vehicle_id CHAR(36),
        type VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        cost DECIMAL(12,2) DEFAULT 0,
        scheduled_at DATETIME NOT NULL,
        completed_at DATETIME NULL,
        alert_sent TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        CHECK (type IN ('preventive', 'corrective')),
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
      )
    `);

    const adminEmail = "admin@fleetplatform.com";
    const adminPassword = "Admin@123";
    const hash = await bcrypt.hash(adminPassword, 10);
    await conn.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES (?, ?, ?, 'admin')
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         password_hash = VALUES(password_hash),
         role = 'admin'`,
      ["System Administrator", adminEmail, hash]
    );
    console.log(`Admin garantido: ${adminEmail} / ${adminPassword}`);

    await conn.commit();
    console.log(`Migration completed successfully on database "${dbName}".`);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    await conn.end();
  }
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
