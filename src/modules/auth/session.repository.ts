import { Session } from "@prisma/client";
import prisma from "../../core/infrastructure/database/prisma";
import { BaseRepository } from "../../core/infrastructure/Repository/base.repository";
import { z } from "zod";

export const SessionCreateSchema = z.object({
  user_id: z.string(),
  token: z.string(),
  expires_at: z.date(),
});

export const SessionUpdateSchema = z.object({
  user_id: z.string().optional(),
  token: z.string().optional(),
  expires_at: z.date().optional(),
});

export const SessionWhereSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().optional(),
  token: z.string().optional(),
  expires_at: z
    .object({
      gt: z.date().optional(),
      gte: z.date().optional(),
      lt: z.date().optional(),
      lte: z.date().optional(),
    })
    .optional(),
});

export type SessionCreateInput = z.infer<typeof SessionCreateSchema>;
export type SessionUpdateInput = z.infer<typeof SessionUpdateSchema>;
export type SessionWhereInput = z.infer<typeof SessionWhereSchema>;

export class SessionRepository extends BaseRepository<
  Session,
  SessionCreateInput,
  SessionUpdateInput,
  SessionWhereInput
> {
  constructor() {
    super(prisma, "session");
  }

  // Session-specific methods
  async findByToken(token: string): Promise<Session | null> {
    return this.findFirst({ token });
  }

  async findByUserId(userId: string): Promise<Session[]> {
    return this.findMany({ user_id: userId });
  }

  async findActiveSessionsByUserId(userId: string): Promise<Session[]> {
    return this.findMany({
      user_id: userId,
      expires_at: {
        gt: new Date(),
      },
    });
  }

  async findExpiredSessions(): Promise<Session[]> {
    return this.findMany({
      expires_at: {
        lt: new Date(),
      },
    });
  }

  async findActiveSessions(): Promise<Session[]> {
    return this.findMany({
      expires_at: {
        gt: new Date(),
      },
    });
  }

  async findSessionWithUser(sessionId: string): Promise<Session | null> {
    return this.findByIdWithRelations(sessionId, {
      user: true,
    });
  }

  async findSessionsWithUser(where?: SessionWhereInput): Promise<Session[]> {
    return this.findWithRelations(where || {}, {
      user: true,
    });
  }

  async findActiveSessionsWithUser(): Promise<Session[]> {
    return this.findSessionsWithUser({
      expires_at: {
        gt: new Date(),
      },
    });
  }

  async deleteExpiredSessions(): Promise<{ count: number }> {
    return this.deleteMany({
      expires_at: {
        lt: new Date(),
      },
    });
  }

  async deleteUserSessions(userId: string): Promise<{ count: number }> {
    return this.deleteMany({ user_id: userId });
  }

  async deleteUserSessionByToken(
    userId: string,
    token: string
  ): Promise<Session | null> {
    const session = await this.findFirst({ user_id: userId, token });
    if (session) {
      return this.delete(session.id);
    }
    return null;
  }

  async isSessionValid(token: string): Promise<boolean> {
    const session = await this.findByToken(token);

    if (!session) return false;

    // Check if session is not expired
    if (session.expires_at < new Date()) {
      // Delete expired session
      await this.delete(session.id);
      return false;
    }

    return true;
  }

  async extendSession(
    sessionId: string,
    newExpiryDate: Date
  ): Promise<Session> {
    return this.update(sessionId, { expires_at: newExpiryDate });
  }

  async getSessionStats(): Promise<{
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
  }> {
    const now = new Date();
    const [totalSessions, activeSessions, expiredSessions] = await Promise.all([
      this.count(),
      this.count({
        expires_at: {
          gt: now,
        },
      }),
      this.count({
        expires_at: {
          lt: now,
        },
      }),
    ]);

    return {
      totalSessions,
      activeSessions,
      expiredSessions,
    };
  }

  async findSessionsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Session[]> {
    return this.findInDateRange("created_at", startDate, endDate);
  }

  async findSessionsByExpiryRange(
    startDate: Date,
    endDate: Date
  ): Promise<Session[]> {
    return this.findMany({
      expires_at: {
        gte: startDate,
        lte: endDate,
      },
    });
  }

  async getUserActiveSessionCount(userId: string): Promise<number> {
    return this.count({
      user_id: userId,
      expires_at: {
        gt: new Date(),
      },
    });
  }

  async cleanupExpiredSessions(): Promise<{ count: number }> {
    return this.deleteExpiredSessions();
  }
}
