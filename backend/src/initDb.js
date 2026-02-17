import { closePool, ensureDatabaseExists } from "./db.js";
import { ensureUsersTable } from "./dbSchema.js";

async function run() {
  await ensureDatabaseExists();
  await ensureUsersTable();
  console.log("Database schema is ready");
}

run()
  .then(async () => {
    await closePool();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("Failed to initialize database schema", err);
    await closePool();
    process.exit(1);
  });
