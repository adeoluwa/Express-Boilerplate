import {
  asValue,
  createContainer,
  InjectionMode,
  AwilixContainer,
} from "awilix";

import prisma from "@core/infrastructure/database/prisma";
import { loadModules } from "./loader";

export function buildContainer(): AwilixContainer {
  const container = createContainer({ injectionMode: InjectionMode.PROXY });

  // Register core dependencies
  container.register({
    prisma: asValue(prisma),
    env: asValue(process.env),
  });

  // Load all modules automatically
  loadModules(container);

  return container;
}
