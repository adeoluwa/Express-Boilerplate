import { Server } from "http";
import prisma from "@core/infrastructure/database/prisma";
import { logger } from "@shared/logger";

export function setUpGracefulShutdown(app: any, server: Server) {
  let connections = new Set<any>();

  // Track all connections
  server.on("connection", (conn) => {
    connections.add(conn);
    conn.on("close", () => connections.delete(conn));
  });

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    try {
      // Stop taking new requests
      server.close(async (err) => {
        if (err) {
          logger.error({ err }, "Error closing server");
          process.exit(1);
        }

        logger.info("🛑 Server stopped accepting new connections");

        // 2. Wait for in-flight requests to complete
        await new Promise<void>((resolve) => {
          const check = () => {
            if (connections.size === 0) {
              logger.info("✅ All connections closed");
              resolve();
            } else {
              logger.info(
                `⏳ Waiting for ${connections.size} active connection(s) to complete...`
              );

              setTimeout(check, 1000); // check again in 1s
            }
          };

          check();
        });

        // 3. Disconnect Prisma
        await prisma.$disconnect();
        logger.info("📦 Prisma disconnected");

        logger.info("Graceful shutdown complete ✅");
      });
    } catch (error) {
      const exception: Error = error as Error;

      logger.error(
        {
          message: exception.message,
          name: exception.name,
          stack: exception.stack,
        },
        "Error during shutdown"
      );

      process.exit(1);
    }
  };

  ["SIGINT", "SIGTERM", "SIGQUIT"].forEach((sig) =>
    process.on(sig, () => shutdown(sig))
  );

  process.on("uncaughtException", (err) => {
    logger.error({ err }, "Uncaught Exception");
    shutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "Unhandles Rejection");
    shutdown("unhandledRejection");
  });
}
