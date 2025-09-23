import { z } from "zod";

// User DTOs
export const CreateUserDTO = z.object({
  email: z.string().email("Invalid email format"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const LoginDTO = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const TokenDTO = z.object({
  token: z.string().min(1, "Token is required"),
});

export const UpdateUserDTO = z.object({
  email: z.string().email("Invalid email format").optional(),
  first_name: z.string().min(1, "First name is required").optional(),
  last_name: z.string().min(1, "Last name is required").optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
});

export const UserParamsDTO = z.object({
  id: z.string().uuid("Invalid user ID format"),
});

export const UserQueryDTO = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10)),
  sort: z.string().optional(),
  search: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  created_at: z.string().optional(),
});

export const DateRangeQueryDTO = z.object({
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
});

// OTP DTOs
export const CreateOTPDTO = z.object({
  email: z.string().email("Invalid email format"),
  code: z.string().min(4, "OTP code must be at least 4 characters"),
  purpose: z.string().min(1, "Purpose is required"),
});

export const VerifyOTPDTO = z.object({
  email: z.string().email("Invalid email format"),
  code: z.string().min(4, "OTP code must be at least 4 characters"),
  purpose: z.string().min(1, "Purpose is required"),
});

export const OTPParamsDTO = z.object({
  id: z.string().uuid("Invalid OTP ID format"),
});

// Session DTOs
export const CreateSessionDTO = z.object({
  user_id: z.string().uuid("Invalid user ID format"),
  token: z.string().min(1, "Token is required"),
  expires_at: z.string().transform((val) => new Date(val)),
});

export const SessionParamsDTO = z.object({
  id: z.string().uuid("Invalid session ID format"),
});

export const SessionQueryDTO = z.object({
  user_id: z.string().uuid().optional(),
  token: z.string().optional(),
  active: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

// Common response DTOs
export const SuccessResponseDTO = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
});

export const PaginationResponseDTO = z.object({
  success: z.boolean(),
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

// Type exports
export type CreateUserInput = z.infer<typeof CreateUserDTO>;
export type UpdateUserInput = z.infer<typeof UpdateUserDTO>;
export type UserParams = z.infer<typeof UserParamsDTO>;
export type UserQuery = z.infer<typeof UserQueryDTO>;
export type DateRangeQuery = z.infer<typeof DateRangeQueryDTO>;

export type CreateOTPInput = z.infer<typeof CreateOTPDTO>;
export type VerifyOTPInput = z.infer<typeof VerifyOTPDTO>;
export type OTPParams = z.infer<typeof OTPParamsDTO>;

export type CreateSessionInput = z.infer<typeof CreateSessionDTO>;
export type SessionParams = z.infer<typeof SessionParamsDTO>;
export type SessionQuery = z.infer<typeof SessionQueryDTO>;

export type SuccessResponse = z.infer<typeof SuccessResponseDTO>;
export type PaginationResponse = z.infer<typeof PaginationResponseDTO>;
