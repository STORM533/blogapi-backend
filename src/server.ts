import app from "./app.js";
import prisma from "./lib/prisma.js";

const PORT = process.env.PORT || 3000;
const SHUTDOWN_TIMEOUT_MS = 10_000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

function shutdown(signal: string) {
  console.log(`${signal} received. Shutting down gracefully...`);

  const forceExit = setTimeout(() => {
    console.error("Graceful shutdown timed out. Forcing exit.");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  server.close(async () => {
    clearTimeout(forceExit);
    try {
      await prisma.$disconnect();
      console.log("Prisma client disconnected.");
      process.exit(0);
    } catch (err) {
      console.error("Error during Prisma disconnect:", err);
      process.exit(1);
    }
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
