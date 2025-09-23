import { BaseService } from "@core/application/base-service";
import { UserRepository } from "@modules/user";
import { SessionRepository } from "@modules/auth";
import type { CreateUserInput } from "@modules/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthService extends BaseService {
  constructor(
    private userRepository: UserRepository,
    private sessionRepository: SessionRepository
  ) {
    super();
  }

  // Register a new user
  async register(userData: CreateUserInput) {
    try {
      this.validateRequired(userData, [
        "email",
        "first_name",
        "last_name",
        "password",
      ]);

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(
        userData.email
      );
      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const sanitizedData = this.sanitizeInput({
        ...userData,
        password: hashedPassword,
      });

      const user = await this.userRepository.create(sanitizedData);

      // Generate JWT token
      const token = this.generateToken(user.id);

      return {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          created_at: user.created_at,
        },
        token,
      };
    } catch (error) {
      return this.handleError(error, "register");
    }
  }

  // Login user
  async login(email: string, password: string) {
    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // Find user by email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new Error("Invalid credentials");
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error("Invalid credentials");
      }

      // Generate JWT token
      const token = this.generateToken(user.id);

      // Create session
      const session = await this.sessionRepository.create({
        user_id: user.id,
        token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          created_at: user.created_at,
        },
        token,
        session_id: session.id,
      };
    } catch (error) {
      return this.handleError(error, "login");
    }
  }

  // Logout user
  async logout(token: string) {
    try {
      if (!token) {
        throw new Error("Token is required");
      }

      // Find and delete session
      const session = await this.sessionRepository.findByToken(token);
      if (session) {
        await this.sessionRepository.delete(session.id);
      }

      return { success: true, message: "Logged out successfully" };
    } catch (error) {
      return this.handleError(error, "logout");
    }
  }

  // Verify token
  async verifyToken(token: string) {
    try {
      if (!token) {
        throw new Error("Token is required");
      }

      // Check if session is valid
      const isValid = await this.sessionRepository.isSessionValid(token);
      if (!isValid) {
        throw new Error("Invalid or expired token");
      }

      // Get session with user
      const session = await this.sessionRepository.findSessionWithUser(token);
      if (!session) {
        throw new Error("Session not found");
      }

      return {
        valid: true,
        user: {
          id: session.user_id,
          // email: session.user.email,
          // first_name: session.user.first_name,
          // last_name: session.user.last_name,
        },
      };
    } catch (error) {
      return this.handleError(error, "verifyToken");
    }
  }

  // Generate JWT token
  private generateToken(userId: string): string {
    const secret = process.env.JWT_SECRET || "your-secret-key";
    return jwt.sign({ userId }, secret, { expiresIn: "24h" });
  }

  // Verify JWT token
  private verifyJWTToken(token: string): any {
    const secret = process.env.JWT_SECRET || "your-secret-key";
    return jwt.verify(token, secret);
  }
}
