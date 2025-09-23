import { OTP, OTPStatus } from "@prisma/client";
import prisma from "../../core/infrastructure/database/prisma";
import { BaseRepository } from "../../core/infrastructure/Repository/base.repository";
import { z } from "zod";

export const OTPCreateSchema = z.object({
  email: z.string().email(),
  code: z.string(),
  purpose: z.string(),
  status: z.nativeEnum(OTPStatus).optional(),
});

export const OTPUpdateSchema = z.object({
  email: z.string().email().optional(),
  code: z.string().optional(),
  purpose: z.string().optional(),
  status: z.nativeEnum(OTPStatus).optional(),
});

export const OTPWhereSchema = z.object({
  id: z.string().optional(),
  email: z.string().optional(),
  code: z.string().optional(),
  purpose: z.string().optional(),
  status: z.nativeEnum(OTPStatus).optional(),
  created_at: z
    .object({
      lt: z.date().optional(),
      gt: z.date().optional(),
      gte: z.date().optional(),
      lte: z.date().optional(),
    })
    .optional(),
});

export type OTPCreateInput = z.infer<typeof OTPCreateSchema>;
export type OTPUpdateInput = z.infer<typeof OTPUpdateSchema>;
export type OTPWhereInput = z.infer<typeof OTPWhereSchema>;

export class OTPRepository extends BaseRepository<
  OTP,
  OTPCreateInput,
  OTPUpdateInput,
  OTPWhereInput
> {
  constructor() {
    super(prisma, "otp");
  }

  // OTP-specific methods
  async findByEmail(email: string): Promise<OTP | null> {
    return this.findFirst({ email });
  }

  async findByEmailAndPurpose(
    email: string,
    purpose: string
  ): Promise<OTP | null> {
    return this.findFirst({ email, purpose });
  }

  async findByCode(code: string): Promise<OTP | null> {
    return this.findFirst({ code });
  }

  async findByEmailAndCode(email: string, code: string): Promise<OTP | null> {
    return this.findFirst({ email, code });
  }

  async findPendingOTPs(): Promise<OTP[]> {
    return this.findMany({ status: OTPStatus.PENDING });
  }

  async findExpiredOTPs(): Promise<OTP[]> {
    return this.findMany({ status: OTPStatus.EXPIRED });
  }

  async findVerifiedOTPs(): Promise<OTP[]> {
    return this.findMany({ status: OTPStatus.VERIFIED });
  }

  async findOTPsByPurpose(purpose: string): Promise<OTP[]> {
    return this.findMany({ purpose });
  }

  async findOTPsByEmail(email: string): Promise<OTP[]> {
    return this.findMany({ email });
  }

  async findExpiredOTPsByDate(expiryDate: Date): Promise<OTP[]> {
    return this.findMany({
      created_at: {
        lt: expiryDate,
      },
      status: OTPStatus.PENDING,
    });
  }

  async markAsVerified(id: string): Promise<OTP> {
    return this.update(id, { status: OTPStatus.VERIFIED });
  }

  async markAsExpired(id: string): Promise<OTP> {
    return this.update(id, { status: OTPStatus.EXPIRED });
  }

  async markAsExpiredByEmail(email: string): Promise<{ count: number }> {
    return this.updateMany(
      { email, status: OTPStatus.PENDING },
      { status: OTPStatus.EXPIRED }
    );
  }

  async deleteExpiredOTPs(): Promise<{ count: number }> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.deleteMany({
      created_at: {
        lt: oneHourAgo,
      },
      status: OTPStatus.PENDING,
    });
  }

  async getOTPStats(): Promise<{
    totalOTPs: number;
    pendingOTPs: number;
    verifiedOTPs: number;
    expiredOTPs: number;
  }> {
    const [totalOTPs, pendingOTPs, verifiedOTPs, expiredOTPs] =
      await Promise.all([
        this.count(),
        this.count({ status: OTPStatus.PENDING }),
        this.count({ status: OTPStatus.VERIFIED }),
        this.count({ status: OTPStatus.EXPIRED }),
      ]);

    return {
      totalOTPs,
      pendingOTPs,
      verifiedOTPs,
      expiredOTPs,
    };
  }

  async findRecentOTPsByEmail(
    email: string,
    limit: number = 5
  ): Promise<OTP[]> {
    return this.findMany(
      { email },
      {
        sort: [{ field: "created_at", direction: "desc" }],
        pagination: { limit },
      }
    );
  }

  async isOTPValid(
    email: string,
    code: string,
    purpose: string
  ): Promise<boolean> {
    const otp = await this.findByEmailAndCode(email, code);

    if (!otp) return false;

    // Check if OTP is for the correct purpose
    if (otp.purpose !== purpose) return false;

    // Check if OTP is still pending
    if (otp.status !== OTPStatus.PENDING) return false;

    // Check if OTP is not expired (assuming 10 minutes expiry)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    if (otp.created_at < tenMinutesAgo) {
      // Mark as expired
      await this.markAsExpired(otp.id);
      return false;
    }

    return true;
  }
}
