import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

function getPoolConfig(): mysql.PoolOptions {
  const url = process.env.DATABASE_URL;

  if (url?.startsWith("mysql://")) {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 3306,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, ""),
      waitForConnections: true,
      connectionLimit: 10,
    };
  }

  return {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "fleet_db",
    waitForConnections: true,
    connectionLimit: 10,
  };
}

export const pool = mysql.createPool(getPoolConfig());

/** Converte placeholders PostgreSQL ($1) para MySQL (?) */
function toMysql(sql: string): string {
  return sql.replace(/\$(\d+)/g, "?");
}

export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const [rows] = await pool.execute(toMysql(text), params as (string | number | boolean | null)[]);
  return rows as T[];
}

export function getDbName(): string {
  const url = process.env.DATABASE_URL;
  if (url?.startsWith("mysql://")) {
    return new URL(url).pathname.replace(/^\//, "") || "fleet_db";
  }
  return process.env.DB_NAME || "fleet_db";
}
