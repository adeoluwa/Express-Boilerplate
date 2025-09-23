import { createRoutingController } from "@core/interfaces/rest/rest";
import { AuthService } from "./auth.service";
import { CreateUserDTO, LoginDTO, TokenDTO } from "@core/application/dtos";

// Default export for loadControllers to use
export default function createAuthController() {
  return createRoutingController("/auth", {
    "/register": ({ controller }) => ({
      post: controller({
        body: CreateUserDTO,
        handler: async ({ ctx, body }) => {
          const result = await (
            ctx.scope.resolve("authService") as AuthService
          ).register(body);
          return {
            success: true,
            data: result,
            message: "User registered successfully",
          };
        },
      }),
    }),

    "/login": ({ controller }) => ({
      post: controller({
        body: LoginDTO,
        handler: async ({ ctx, body }) => {
          const result = await (
            ctx.scope.resolve("authService") as AuthService
          ).login(body.email, body.password);
          return {
            success: true,
            data: result,
            message: "Login successful",
          };
        },
      }),
    }),

    "/logout": ({ controller }) => ({
      post: controller({
        body: TokenDTO,
        handler: async ({ ctx, body }) => {
          const result = await (
            ctx.scope.resolve("authService") as AuthService
          ).logout(body.token);
          return result;
        },
      }),
    }),

    "/verify": ({ controller }) => ({
      post: controller({
        body: TokenDTO,
        handler: async ({ ctx, body }) => {
          const result = await (
            ctx.scope.resolve("authService") as AuthService
          ).verifyToken(body.token);
          return {
            success: true,
            data: result,
          };
        },
      }),
    }),
  });
}
