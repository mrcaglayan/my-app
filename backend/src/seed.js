import bcrypt from "bcrypt";
import { closePool, ensureDatabaseExists, query } from "./db.js";
import { ensureUsersTable } from "./dbSchema.js";

const email = "test@example.com";
const password = "123456";
const name = "Test User";

const run = async () => {
  await ensureDatabaseExists();
  await ensureUsersTable();

  const hash = await bcrypt.hash(password, 10);

  await query(
    `INSERT INTO users (email, password_hash, name)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE
     password_hash = VALUES(password_hash),
     name = VALUES(name)`,
    [email, hash, name]
  );

  console.log("Seeded:", { email, password });
  await closePool();
  process.exit(0);
};

run().catch(async (e) => {
  console.error(e);
  await closePool();
  process.exit(1);
});
