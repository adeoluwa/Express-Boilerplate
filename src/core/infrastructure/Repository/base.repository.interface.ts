// import { PrismaClient } from "@prisma/client";

import prisma from "../database/prisma";

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface FilterOptions {
  [key: string]: any;
}

export interface SortOptions {
  field: string;
  direction: "asc" | "desc";
}

export interface QueryOptions {
  filters?: FilterOptions;
  sort?: SortOptions[];
  pagination?: PaginationOptions;
  include?: any;
  select?: any;
}

export interface IBaseRepository<T, CreateInput, UpdateInput, WhereInput> {
  // Basic CRUD operations
  create(data: CreateInput): Promise<T>;
  createMany(data: CreateInput[]): Promise<{ count: number }>;
  findById(id: string): Promise<T | null>;
  findFirst(where: WhereInput): Promise<T | null>;
  findMany(where?: WhereInput, options?: QueryOptions): Promise<T[]>;
  findManyPaginated(
    where?: WhereInput,
    options?: QueryOptions
  ): Promise<PaginationResult<T>>;
  update(id: string, data: UpdateInput): Promise<T>;
  updateMany(where: WhereInput, data: UpdateInput): Promise<{ count: number }>;
  delete(id: string): Promise<T>;
  deleteMany(where: WhereInput): Promise<{ count: number }>;
  count(where?: WhereInput): Promise<number>;
  exists(where: WhereInput): Promise<boolean>;

  // Advanced query operations
  findWithRelations(where: WhereInput, include: any): Promise<T[]>;
  findFirstWithRelations(where: WhereInput, include: any): Promise<T | null>;
  findByIdWithRelations(id: string, include: any): Promise<T | null>;

  // Utility operations
  upsert(
    where: WhereInput,
    create: CreateInput,
    update: UpdateInput
  ): Promise<T>;
  findOrCreate(where: WhereInput, create: CreateInput): Promise<T>;
}
