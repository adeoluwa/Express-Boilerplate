import { createRoutingController } from "@core/interfaces/rest/rest";
import { UserService } from "./user.service";
import { UpdateUserDTO, UserParamsDTO } from "@core/application/dtos";

// Default export for loadControllers to use
export default function createUserController() {
  return createRoutingController("/users", {
    "/active": ({ controller }) => ({
      get: controller({
        handler: async ({ ctx }) => {
          const users = await (
            ctx.scope.resolve("userService") as UserService
          ).getActiveUsers();
          return {
            success: true,
            data: users,
          };
        },
      }),
    }),

    "/stats": ({ controller }) => ({
      get: controller({
        handler: async ({ ctx }) => {
          const stats = await (
            ctx.scope.resolve("userService") as UserService
          ).getUserStats();
          return {
            success: true,
            data: stats,
          };
        },
      }),
    }),

    "/:id": ({ controller }) => ({
      get: controller({
        params: UserParamsDTO,
        handler: async ({ ctx, params }) => {
          const user = await (
            ctx.scope.resolve("userService") as UserService
          ).getUserById(params.id);
          if (!user) {
            throw new Error("User not found");
          }
          return {
            success: true,
            data: user,
          };
        },
      }),

      put: controller({
        params: UserParamsDTO,
        body: UpdateUserDTO,
        handler: async ({ ctx, params, body }) => {
          const user = await (
            ctx.scope.resolve("userService") as UserService
          ).updateUser(params.id, body);
          return {
            success: true,
            data: user,
            message: "User updated successfully",
          };
        },
      }),

      delete: controller({
        params: UserParamsDTO,
        handler: async ({ ctx, params }) => {
          await (ctx.scope.resolve("userService") as UserService).deleteUser(
            params.id
          );
          return {
            success: true,
            message: "User deleted successfully",
          };
        },
      }),
    }),

    "/:id/sessions": ({ controller }) => ({
      get: controller({
        params: UserParamsDTO,
        handler: async ({ ctx, params }) => {
          const user = await (
            ctx.scope.resolve("userService") as UserService
          ).getUserWithSessions(params.id);
          if (!user) {
            throw new Error("User not found");
          }
          return {
            success: true,
            data: user,
          };
        },
      }),
    }),
  });
}
