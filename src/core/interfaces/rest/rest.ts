import express, { Request, Response, NextFunction, Router } from "express";
import { z, ZodTypeAny } from "zod";

export type HttpMethod =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "options"
  | "head";

export type Ctx = {
  req: Request;
  res: Response;
  /** awilix request scope (from scopePerRequest) */
  scope: any;
  /** set by your auth middleware */
  user?: unknown;
};

type HandlerArgs<B = unknown, Q = unknown, P = unknown> = {
  ctx: Ctx;
  body: B;
  query: Q;
  params: P;
};

type AnyMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => unknown;

export type ControllerConfig<
  B extends ZodTypeAny | undefined = undefined,
  Q extends ZodTypeAny | undefined = undefined,
  P extends ZodTypeAny | undefined = undefined
> = {
  /** Optional Zod schemas; if provided, the request parts are validated & parsed */
  body?: B;
  query?: Q;
  params?: P;

  /** Express middlewares to run before the handler (e.g., AuthorizedUser()) */
  middlewares?: AnyMiddleware[];

  /** Business handler */
  handler: (
    args: HandlerArgs<
      B extends ZodTypeAny ? z.infer<B> : unknown,
      Q extends ZodTypeAny ? z.infer<Q> : unknown,
      P extends ZodTypeAny ? z.infer<P> : unknown
    >
  ) => Promise<unknown> | unknown;
};

type RouteBuilder = (args: {
  controller: typeof controller;
}) => Partial<Record<HttpMethod, ReturnType<typeof controller>>>;

type RouteMap = Record<string, RouteBuilder>;

/** --- Helpers --- */
function parseOrThrow<T extends ZodTypeAny>(
  schema: T,
  value: unknown,
  part: "body" | "query" | "params"
): z.infer<T> {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    const err: any = new Error(`Invalid ${part}`);
    err.status = 422;
    err.details = parsed.error.format();
    throw err;
  }
  return parsed.data;
}

/** Wraps a handler with optional validation + middlewares; returns an array you can spread into router[method] */
export function controller<
  B extends ZodTypeAny | undefined = undefined,
  Q extends ZodTypeAny | undefined = undefined,
  P extends ZodTypeAny | undefined = undefined
>(config: ControllerConfig<B, Q, P>) {
  const mws = config.middlewares ?? [];

  const wrapped = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = config.body
        ? parseOrThrow(config.body, req.body, "body")
        : (req.body as any);
      const query = config.query
        ? parseOrThrow(config.query, req.query, "query")
        : (req.query as any);
      const params = config.params
        ? parseOrThrow(config.params, req.params, "params")
        : (req.params as any);

      const ctx: Ctx = {
        req,
        res,
        scope: (req as any).scope, // awilix scope (scopePerRequest)
        user: (req as any).user, // set by your auth middleware
      };

      const data = await config.handler({ ctx, body, query, params });
      if (!res.headersSent) res.json(data);
    } catch (e) {
      next(e);
    }
  };

  return [...mws, wrapped];
}

const GLOBAL_PREFIX = "/api/v1";

/**
 * Declaratively define routes and get back a Router mounted under `basePath`.
 *
 * @example
 * export default createRoutingController("/auth", {
 *   "/login": ({ controller }) => ({
 *     post: controller({
 *       body: LoginDTO,
 *       handler: async ({ ctx, body }) => {
 *         // handle login
 *       },
 *     }),
 *   }),
 *
 *   "/me": ({ controller }) => ({
 *     get: controller({
 *       middlewares: [AuthorizedUser()],
 *       handler: async ({ ctx }) => {
 *         // return user info
 *       },
 *     }),
 *   }),
 * });
 */

export function createRoutingController(
  basePath: string,
  routes: RouteMap
): Router {
  const innerRouter = express.Router();

  for (const [subPath, build] of Object.entries(routes)) {
    const methods = build({ controller });

    for (const [method, handlers] of Object.entries(methods)) {
      const verb = method.toLowerCase() as HttpMethod;

      if (!innerRouter[verb]) {
        throw new Error(
          `Unsupported HTTP method "${method}" on path "${subPath}"`
        );
      }

      innerRouter[verb](subPath, ...handlers);
    }
  }

  const base = express.Router();
  base.use(`${GLOBAL_PREFIX}${basePath}`, innerRouter);
  return base;
}
