export abstract class BaseService {
  constructor() {
    // Base service constructor - can be extended by child services
  }

  // Common utility methods that can be used across services
  protected async handleError(error: any, context: string): Promise<never> {
    console.error(`Error in ${context}:`, error);
    throw new Error(`Service error in ${context}: ${error.message}`);
  }

  protected validateRequired(data: any, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(
      (field) =>
        data[field] === undefined || data[field] === null || data[field] === ""
    );

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }
  }

  protected sanitizeInput(input: any): any {
    if (typeof input === "string") {
      return input.trim();
    }
    if (typeof input === "object" && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    return input;
  }
}
