import type { User, Session } from "@prisma/client";
import prisma from "../../core/infrastructure/database/prisma";
import { BaseRepository } from "../../core/infrastructure/Repository/base.repository";
import { z } from "zod";

export const UserCreateSchema = z.object({
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  password: z.string(),
});

export const UserUpdateSchema = z.object({
  email: z.string().email().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  password: z.string().optional(),
});

export const UserWhereSchema = z.object({
  id: z.string().optional(),
  email: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

export type UserCreateInput = z.infer<typeof UserCreateSchema>;
export type CreateUserInput = UserCreateInput; // Alias for CreateUserInput
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;
export type UserWhereInput = z.infer<typeof UserWhereSchema>;

export class UserRepository extends BaseRepository<
  User,
  UserCreateInput,
  UserUpdateInput,
  UserWhereInput
> {
  constructor() {
    super(prisma, "user");
  }

  // User-specific methods
  async findByEmail(email: string): Promise<User | null> {
    return this.findFirst({ email });
  }

  async findByIdWithSessions(id: string): Promise<User | null> {
    return this.findByIdWithRelations(id, {
      Session: true,
    });
  }

  async findUsersWithSessions(where?: UserWhereInput): Promise<User[]> {
    return this.findWithRelations(where || {}, {
      Session: true,
    });
  }

  async findActiveUsers(): Promise<User[]> {
    // The 'Session' property is not valid in the base where filter.
    // Instead, use findWithRelations to filter users with at least one active session.
    return this.findWithRelations(
      {},
      {
        Session: {
          where: {
            expires_at: {
              gt: new Date(),
            },
          },
        },
      }
    );
  }

  async findUsersByCreatedDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<User[]> {
    return this.findInDateRange("created_at", startDate, endDate);
  }

  async searchUsers(searchTerm: string): Promise<User[]> {
    return this.search(searchTerm, ["email", "first_name", "last_name"]);
  }

  async findUsersWithExpiredSessions(): Promise<User[]> {
    // The 'Session' property is not valid in the base where filter.
    // Use findWithRelations to filter users with at least one expired session.
    return this.findWithRelations(
      {},
      {
        Session: {
          where: {
            expires_at: {
              lt: new Date(),
            },
          },
        },
      }
    );
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    usersWithSessions: number;
  }> {
    const [totalUsers, activeUsers, usersWithSessions] = await Promise.all([
      this.count(),
      this.countWithRelationFilter("Session", {
        expires_at: {
          gt: new Date(),
        },
      }),
      this.countWithRelationFilter("Session", {
        expires_at: {
          gt: undefined,
        },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      usersWithSessions,
    };
  }
  async countWithRelationFilter(
    relationName: string,
    relationFilter: any
  ): Promise<number> {
    return (this.prisma as any)[this.modelName].count({
      where: {
        [relationName]: {
          some: relationFilter,
        },
      },
    });
  }
}
