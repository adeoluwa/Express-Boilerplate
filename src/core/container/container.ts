import path from "path";
import {
  asClass,
  asFunction,
  asValue,
  createContainer,
  InjectionMode,
  AwilixContainer,
} from "awilix";

import prisma from "@core/infrastructure/database/prisma";

export function buildContainer(): AwilixContainer {
  const container = createContainer({ injectionMode: InjectionMode.PROXY });

  // register the prisma singleton instance as "prisma"
  container.register({
    prisma: asValue(prisma()),
    env: asValue(process.env),
  });

  // Autoload repos/services (scoped per request)
  container.loadModules(
    [
      ["**/*.repo.*", { register: registerScoped }],
      ["**/*.service.*", { register: registerScoped }],
    ],
    {
      cwd: path.join(__dirname, ".."),
      formatName,
    }
  );

  return container;
}

function registerScoped(mod: any) {
  const thing = mod.default ?? mod;
  return typeof thing === "function"
    ? asClass(thing).scoped()
    : asFunction(thing).scoped();
}

function registerSingleton(mod: any) {
  const thing = mod.default ?? mod;
  return typeof thing === "function"
    ? asClass(thing).singleton()
    : asFunction(thing).singleton();
}
function formatName(name: string) {
  // "auth.service" -> "authService", "user.repo" -> "userRepo"
  const [base, kind] = (() => {
    const parts = name.split(".");
    return [parts.slice(0, -1).join("."), parts[parts.length - 1]];
  })();
  return toCamel(`${base}-${kind}`);
}
function toCamel(s: string) {
  return s.replace(/[-_.](\w)/g, (_, c) => c.toUpperCase());
}
