// import { Prisma } from "@prisma/client";

export class QueryBuilder {
  /**
   * Build where clause for Prisma queries
   */
  static buildWhereClause(filters: Record<string, any>): any {
    if (!filters || Object.keys(filters).length === 0) {
      return {};
    }

    const where: any = {};

    for (const [key, value] of Object.entries(filters)) {
      if (value === null || value === undefined) {
        continue;
      }

      // Handle nested filters (e.g., { user: { email: "test@example.com" } })
      // But skip comparison operators like { gt: Date, lt: Date }
      if (
        typeof value === "object" &&
        !Array.isArray(value) &&
        !(value instanceof Date) &&
        !this.isComparisonOperator(value)
      ) {
        where[key] = this.buildWhereClause(value);
        continue;
      }

      // Handle array values (IN operator)
      if (Array.isArray(value)) {
        where[key] = { in: value };
        continue;
      }

      // Handle string operations
      if (typeof value === "string") {
        // Check for special operators
        if (value.startsWith("like:")) {
          where[key] = { contains: value.replace("like:", "") };
        } else if (value.startsWith("startsWith:")) {
          where[key] = { startsWith: value.replace("startsWith:", "") };
        } else if (value.startsWith("endsWith:")) {
          where[key] = { endsWith: value.replace("endsWith:", "") };
        } else if (value.startsWith("gt:")) {
          where[key] = { gt: this.parseValue(value.replace("gt:", "")) };
        } else if (value.startsWith("gte:")) {
          where[key] = { gte: this.parseValue(value.replace("gte:", "")) };
        } else if (value.startsWith("lt:")) {
          where[key] = { lt: this.parseValue(value.replace("lt:", "")) };
        } else if (value.startsWith("lte:")) {
          where[key] = { lte: this.parseValue(value.replace("lte:", "")) };
        } else if (value.startsWith("not:")) {
          where[key] = { not: this.parseValue(value.replace("not:", "")) };
        } else {
          where[key] = value;
        }
        continue;
      }

      // Default case
      where[key] = value;
    }

    return where;
  }

  /**
   * Build orderBy clause for Prisma queries
   */
  static buildOrderByClause(
    sortOptions: Array<{ field: string; direction: "asc" | "desc" }>
  ): any {
    if (!sortOptions || sortOptions.length === 0) {
      return { createdAt: "desc" }; // Default sort
    }

    return sortOptions.map((option) => ({
      [option.field]: option.direction,
    }));
  }

  /**
   * Build pagination parameters
   */
  static buildPaginationParams(pagination?: { page?: number; limit?: number }) {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    return { skip, take: limit, page, limit };
  }

  /**
   * Check if an object is a Prisma comparison operator
   */
  private static isComparisonOperator(value: any): boolean {
    if (typeof value !== "object" || Array.isArray(value) || value === null) {
      return false;
    }

    const comparisonKeys = [
      "gt",
      "gte",
      "lt",
      "lte",
      "not",
      "in",
      "notIn",
      "contains",
      "startsWith",
      "endsWith",
      "mode",
    ];
    const keys = Object.keys(value);

    // If all keys are comparison operators, it's a comparison object
    return keys.length > 0 && keys.every((key) => comparisonKeys.includes(key));
  }

  /**
   * Parse string values to appropriate types
   */
  private static parseValue(value: string): any {
    // Try to parse as number
    if (!isNaN(Number(value))) {
      return Number(value);
    }

    // Try to parse as boolean
    if (value === "true") return true;
    if (value === "false") return false;

    // Try to parse as date
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }

    // Return as string
    return value;
  }

  /**
   * Build search query for text fields
   */
  static buildSearchQuery(searchTerm: string, searchFields: string[]): any {
    if (!searchTerm || searchFields.length === 0) {
      return {};
    }

    return {
      OR: searchFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive" as const,
        },
      })),
    };
  }

  /**
   * Build date range query
   */
  static buildDateRangeQuery(
    field: string,
    startDate?: Date,
    endDate?: Date
  ): any {
    const query: any = {};

    if (startDate && endDate) {
      query[field] = {
        gte: startDate,
        lte: endDate,
      };
    } else if (startDate) {
      query[field] = { gte: startDate };
    } else if (endDate) {
      query[field] = { lte: endDate };
    }

    return query;
  }
}
