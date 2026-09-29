import "dotenv/config";
import fs from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    ca: fs.readFileSync(process.env.RDS_CA_CERT!, "utf8"),
  },
});

const prisma = new PrismaClient({ adapter });

export default prisma;
