import express from "express";
import useragent from "express-useragent";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";

import { buildContainer } from "@core/container/container";
import { attachContainer } from "@core/container/attach";
import { loadControllers } from "@core/interfaces/rest/loadControllers";
import { logger } from "@shared/logger";
import { Config } from "@core/config";
import { testDBConnection } from "@core/infrastructure/database/testDB";
import HttpStatusCodes from "@core/utils/HttpStatusCode";
import { setUpGracefulShutdown } from "./server-shutdown";

export async function buildApp() {
  const app = express();

  await testDBConnection();

  app.use(
    cors({
      origin: true,
      optionsSuccessStatus: 200,
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(useragent.express());

  if (process.env.NODE_ENV === "development") {
    app.use(
      morgan(":method :status :url :res[content-length] - :response-time ms", {
        stream: {
          // Configure Morgan to use custom logger with the http severity.

          // FIXME: using the http severity prepends 'undefined' to the message
          write: (message) => logger.info(message.trim()),
        },
      })
    );
  }

  if (process.env.NODE_ENV === "production") {
    app.use(helmet());
  }

  const container = buildContainer();
  attachContainer(app, container);

  await loadControllers(app);

  app.use(
    (
      err: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      res.status(err.status ?? 500).json({
        message: err.message ?? "Internal server Error",
        details: err.details,
      });
    }
  );

  app.get("/", (_req, res, _next) => {
    res.status(HttpStatusCodes.OK).json({
      AppName: `${Config.APP_NAME}`,
      Env: `${Config.APP_ENV}`,
      Message: `${Config.APP_NAME} API is running`,
    });
  });

  const server = app.listen(Config.PORT, () => {
    logger.info(
      `${Config.APP_NAME} server serving on port http://localhost:${Config.PORT}`
    );
  });

  setUpGracefulShutdown(app, server);

  return app;
}
