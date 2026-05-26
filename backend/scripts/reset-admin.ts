import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { query } from "../src/database/connection";

dotenv.config();

const ADMIN_EMAIL = "admin@fleetplatform.com";
const ADMIN_PASSWORD = "Admin@123";

async function main() {
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       password_hash = VALUES(password_hash),
       role = 'admin'`,
    ["System Administrator", ADMIN_EMAIL, hash]
  );
  console.log(`Admin OK: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
