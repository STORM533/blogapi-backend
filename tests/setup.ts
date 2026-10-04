import fs from "node:fs";

// Establish the test environment BEFORE any application module is imported.
// passport strategies (JWT secret, Prisma client, rate limiter mode) all
// initialize during module loading, so NODE_ENV must already be "test".
if (fs.existsSync(".env")) {
  process.loadEnvFile(".env");
}

process.env.NODE_ENV = "test";

if (!process.env.TEST_DATABASE_URL) {
  throw new Error(
    "TEST_DATABASE_URL is not configured — add it to .env before running tests",
  );
}
