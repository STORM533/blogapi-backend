import fs from "node:fs";
import { spawn } from "node:child_process";
import pg from "pg";

if (fs.existsSync(".env")) {
  process.loadEnvFile(".env");
}

const testDbUrl = process.env.TEST_DATABASE_URL;

if (!testDbUrl) {
  console.error(
    "ERROR: TEST_DATABASE_URL is not configured.\n" +
      "Add it to .env, e.g.:\n" +
      "  TEST_DATABASE_URL=postgresql://storm:STORM@localhost:5432/test_blog_api",
  );
  process.exit(1);
}

let parsed;
try {
  parsed = new URL(testDbUrl);
} catch {
  console.error(`ERROR: TEST_DATABASE_URL is not a valid URL: ${testDbUrl}`);
  process.exit(1);
}

if (parsed.protocol !== "postgresql:" && parsed.protocol !== "pg:") {
  console.error(
    `ERROR: TEST_DATABASE_URL must be a postgresql:// URL, got: ${parsed.protocol}`,
  );
  process.exit(1);
}

const dbName = parsed.pathname.replace(/^\//, "");
if (!dbName) {
  console.error("ERROR: TEST_DATABASE_URL has no database name in its path.");
  process.exit(1);
}

const maintenanceUrl = new URL(testDbUrl);
maintenanceUrl.pathname = "/postgres";

async function ensureDatabase() {
  const client = new pg.Client({ connectionString: maintenanceUrl.toString() });
  try {
    await client.connect();
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName],
    );
    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Created test database "${dbName}".`);
    } else {
      console.log(`Test database "${dbName}" already exists.`);
    }
  } finally {
    await client.end();
  }
}

function runMigrations() {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["prisma", "migrate", "deploy"], {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: testDbUrl },
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`prisma migrate deploy exited with code ${code}`));
      }
    });
  });
}

try {
  await ensureDatabase();
  await runMigrations();
  console.log("Test database is ready.");
} catch (error) {
  console.error("Failed to provision test database:", error);
  process.exit(1);
}
