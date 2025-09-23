import { BaseService } from "@core/application/base-service";
import {
  UserRepository,
  UserCreateInput,
  UserUpdateInput,
  UserWhereInput,
} from "@modules/user";
import {
  QueryOptions,
  PaginationResult,
} from "@core/infrastructure/Repository/base.repository.interface";
import bcrypt from "bcrypt";

export class UserService extends BaseService {
  constructor(private userRepository: UserRepository) {
    super();
  }

  // Get user by ID
  async getUserById(id: string) {
    try {
      if (!id) {
        throw new Error("User ID is required");
      }

      return await this.userRepository.findById(id);
    } catch (error) {
      return this.handleError(error, "getUserById");
    }
  }

  // Get user by email
  async getUserByEmail(email: string) {
    try {
      if (!email) {
        throw new Error("Email is required");
      }

      return await this.userRepository.findByEmail(email);
    } catch (error) {
      return this.handleError(error, "getUserByEmail");
    }
  }

  // Update user
  async updateUser(id: string, userData: UserUpdateInput) {
    try {
      if (!id) {
        throw new Error("User ID is required");
      }

      // Check if user exists
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        throw new Error("User not found");
      }

      const sanitizedData = this.sanitizeInput(userData);

      // If password is being updated, hash it
      if (sanitizedData.password) {
        sanitizedData.password = await bcrypt.hash(sanitizedData.password, 10);
      }

      return await this.userRepository.update(id, sanitizedData);
    } catch (error) {
      return this.handleError(error, "updateUser");
    }
  }

  // Delete user
  async deleteUser(id: string) {
    try {
      if (!id) {
        throw new Error("User ID is required");
      }

      // Check if user exists
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        throw new Error("User not found");
      }

      return await this.userRepository.delete(id);
    } catch (error) {
      return this.handleError(error, "deleteUser");
    }
  }

  // Get user with sessions
  async getUserWithSessions(id: string) {
    try {
      if (!id) {
        throw new Error("User ID is required");
      }

      return await this.userRepository.findByIdWithSessions(id);
    } catch (error) {
      return this.handleError(error, "getUserWithSessions");
    }
  }

  // Get active users
  async getActiveUsers() {
    try {
      return await this.userRepository.findActiveUsers();
    } catch (error) {
      return this.handleError(error, "getActiveUsers");
    }
  }

  // Get user statistics
  async getUserStats() {
    try {
      return await this.userRepository.getUserStats();
    } catch (error) {
      return this.handleError(error, "getUserStats");
    }
  }

  // Verify user password
  async verifyPassword(email: string, password: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return false;
      }

      return await bcrypt.compare(password, user.password);
    } catch (error) {
      return this.handleError(error, "verifyPassword");
    }
  }
}
