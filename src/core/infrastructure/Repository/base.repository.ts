import { PrismaClient } from "@prisma/client";

import {
  IBaseRepository,
  QueryOptions,
  PaginationResult,
} from "./base.repository.interface";
import { QueryBuilder } from "./query-builder";

export abstract class BaseRepository<T, CreateInput, UpdateInput, WhereInput>
  implements IBaseRepository<T, CreateInput, UpdateInput, WhereInput>
{
  protected prisma: PrismaClient;
  protected modelName: string;

  constructor(prisma: PrismaClient, modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  // Basic CRUD operations
  async create(data: CreateInput): Promise<T> {
    return (this.prisma as any)[this.modelName].create({
      data: data as any,
    });
  }

  async createMany(data: CreateInput[]): Promise<{ count: number }> {
    return (this.prisma as any)[this.modelName].createMany({
      data: data as any,
    });
  }

  async findById(id: string): Promise<T | null> {
    return (this.prisma as any)[this.modelName].findUnique({
      where: { id } as any,
    });
  }

  async findFirst(where: WhereInput): Promise<T | null> {
    return (this.prisma as any)[this.modelName].findFirst({
      where: where as any,
    });
  }

  async findMany(where?: WhereInput, options?: QueryOptions): Promise<T[]> {
    const query: any = {};

    if (where) {
      query.where = QueryBuilder.buildWhereClause(where as any);
    }

    if (options?.sort) {
      query.orderBy = QueryBuilder.buildOrderByClause(options.sort);
    }

    if (options?.include) {
      query.include = options.include;
    }

    if (options?.select) {
      query.select = options.select;
    }

    if (options?.pagination) {
      const { skip, take } = QueryBuilder.buildPaginationParams(
        options.pagination
      );
      query.skip = skip;
      query.take = take;
    }

    return (this.prisma as any)[this.modelName].findMany(query);
  }

  async findManyPaginated(
    where?: WhereInput,
    options?: QueryOptions
  ): Promise<PaginationResult<T>> {
    const { skip, take, page, limit } = QueryBuilder.buildPaginationParams(
      options?.pagination
    );

    const query: any = {};

    if (where) {
      query.where = QueryBuilder.buildWhereClause(where as any);
    }

    if (options?.sort) {
      query.orderBy = QueryBuilder.buildOrderByClause(options.sort);
    }

    if (options?.include) {
      query.include = options.include;
    }

    if (options?.select) {
      query.select = options.select;
    }

    const [data, total] = await Promise.all([
      (this.prisma as any)[this.modelName].findMany({
        ...query,
        skip,
        take,
      }),
      (this.prisma as any)[this.modelName].count({
        where: query.where,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async update(id: string, data: UpdateInput): Promise<T> {
    return (this.prisma as any)[this.modelName].update({
      where: { id } as any,
      data: data as any,
    });
  }

  async updateMany(
    where: WhereInput,
    data: UpdateInput
  ): Promise<{ count: number }> {
    return (this.prisma as any)[this.modelName].updateMany({
      where: QueryBuilder.buildWhereClause(where as any),
      data: data as any,
    });
  }

  async delete(id: string): Promise<T> {
    return (this.prisma as any)[this.modelName].delete({
      where: { id } as any,
    });
  }

  async deleteMany(where: WhereInput): Promise<{ count: number }> {
    return (this.prisma as any)[this.modelName].deleteMany({
      where: QueryBuilder.buildWhereClause(where as any),
    });
  }

  async count(where?: WhereInput): Promise<number> {
    const query: any = {};

    if (where) {
      query.where = QueryBuilder.buildWhereClause(where as any);
    }

    return (this.prisma as any)[this.modelName].count(query);
  }

  async exists(where: WhereInput): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }

  // Advanced query operations
  async findWithRelations(where: WhereInput, include: any): Promise<T[]> {
    return (this.prisma as any)[this.modelName].findMany({
      where: QueryBuilder.buildWhereClause(where as any),
      include,
    });
  }

  async findFirstWithRelations(
    where: WhereInput,
    include: any
  ): Promise<T | null> {
    return (this.prisma as any)[this.modelName].findFirst({
      where: QueryBuilder.buildWhereClause(where as any),
      include,
    });
  }

  async findByIdWithRelations(id: string, include: any): Promise<T | null> {
    return (this.prisma as any)[this.modelName].findUnique({
      where: { id } as any,
      include,
    });
  }

  // Utility operations
  async upsert(
    where: WhereInput,
    create: CreateInput,
    update: UpdateInput
  ): Promise<T> {
    return (this.prisma as any)[this.modelName].upsert({
      where: QueryBuilder.buildWhereClause(where as any),
      create: create as any,
      update: update as any,
    });
  }

  async findOrCreate(where: WhereInput, create: CreateInput): Promise<T> {
    const existing = await this.findFirst(where);
    if (existing) {
      return existing;
    }
    return this.create(create);
  }

  // Helper methods for common queries
  async findByEmail(email: string): Promise<T | null> {
    return this.findFirst({ email } as WhereInput);
  }

  async findByField(field: string, value: any): Promise<T | null> {
    return this.findFirst({ [field]: value } as WhereInput);
  }

  async findManyByField(field: string, value: any): Promise<T[]> {
    return this.findMany({ [field]: value } as WhereInput);
  }

  async search(searchTerm: string, searchFields: string[]): Promise<T[]> {
    const searchQuery = QueryBuilder.buildSearchQuery(searchTerm, searchFields);
    return this.findMany(searchQuery as WhereInput);
  }

  async findInDateRange(
    field: string,
    startDate: Date,
    endDate: Date
  ): Promise<T[]> {
    const dateQuery = QueryBuilder.buildDateRangeQuery(
      field,
      startDate,
      endDate
    );
    return this.findMany(dateQuery as WhereInput);
  }
}
