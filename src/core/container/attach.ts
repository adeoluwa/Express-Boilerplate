import type { Application } from "express";
import { scopePerRequest } from "awilix-express";
import type { AwilixContainer } from "awilix";

export function attachContainer(app: Application, container: AwilixContainer) {
  // attaches req.scope
  app.use(scopePerRequest(container));
}
