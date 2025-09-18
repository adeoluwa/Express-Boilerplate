import prisma from "./prisma";
import { logger } from "@shared/logger";
import { Config } from "@core/config";

export async function testDBConnection(){
  try {
    await prisma.$connect()

    logger.info("Prisma connected to database");

    logger.info(`App: ${Config.APP_NAME} running on ${Config.PORT}`)
  } catch (error) {
    const exception: Error = error as Error;
    console.error("Error connecting to database: ", {
      message: exception.message,
      stack: exception.stack,
      cause: exception.cause,
    });
    logger.error({ error }, "Failed to connect to database:");
    process.exit(1);
  }
}