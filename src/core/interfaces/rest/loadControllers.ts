import express from "express";
import path from "path";
import fg from "fast-glob";
import { logger } from "@shared/logger";


export async function loadControllers(app: express.Application) {

  const files = await fg("**/*.controller.*", {
    cwd: path.join(__dirname, ".."),
  });

 //  const chalk = await import('chalk');
  // const { default: chalk } = await import("chalk");



  if (files.length === 0) {
    logger.warn("No controllers found.");
    return;
  }

  logger.info(`\n🔗 Mounting controllers:`);

  for (const rel of files) {
    const abs = path.join(__dirname, "..", rel);
    const mod = await import(abs);

    const candidates = [mod.default, ...Object.values(mod)];

    for (const c of candidates) {
      if (isRouter(c)) {
        app.use(c);
        logRouter(c, rel);
      }
    }
  }
}

/** detect if export is an Exprerss Router */
function isRouter(x: any) {
  return (
    x && typeof x === "function" && typeof x.use === "function" && "stack" in x
  );
}

/** log all routes of a mounted router */
function logRouter(router: express.Router, file: string) {
  const base = logger.debug(path.basename(file));

  logger.info(`  📦 ${base}`);

  router.stack.forEach((layer: any) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods)
        .map((m) => m.toUpperCase())
        .join(", ");

      const routePath = layer.router.path;
      logger.info(` ${(methods.padEnd(6))} ${routePath}`);
    }
  });
}
