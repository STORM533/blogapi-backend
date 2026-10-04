import "dotenv/config";
import fs from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Database connection string is not configured");
}

const caPath = process.env.RDS_CA_CERT;

const adapter = new PrismaPg({
  connectionString,
  ...(caPath &&
    fs.existsSync(caPath) && {
      ssl: {
        ca: fs.readFileSync(caPath, "utf8"),
      },
    }),
});

const prisma = new PrismaClient({ adapter });

export default prisma;
