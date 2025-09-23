# Repository Pattern Implementation

This directory contains a comprehensive repository pattern implementation for the backend setup using Prisma ORM. The pattern provides a clean separation of concerns by abstracting database operations from business logic.

## 🏗️ Architecture

```
Repository Pattern
├── base.repository.interface.ts    # Interface definitions
├── base.repository.ts              # Base repository implementation
├── query-builder.ts                # Query building utilities
├── user.repository.ts              # User-specific repository
├── otp.repository.ts               # OTP-specific repository
├── session.repository.ts           # Session-specific repository
├── repository.factory.ts           # Repository factory for DI
└── index.ts                        # Exports
```

## 🚀 Features

### Base Repository

- **CRUD Operations**: Create, Read, Update, Delete
- **Pagination**: Built-in pagination support
- **Filtering**: Advanced filtering with query builders
- **Sorting**: Multi-field sorting capabilities
- **Relations**: Support for Prisma relations
- **Search**: Text search across multiple fields
- **Date Ranges**: Date-based filtering
- **Validation**: Input validation and sanitization

### Query Builder

- **String Operations**: `like:`, `startsWith:`, `endsWith:`, `gt:`, `gte:`, `lt:`, `lte:`, `not:`
- **Array Operations**: `in` operator for array values
- **Nested Filters**: Support for nested object filtering
- **Type Parsing**: Automatic type conversion (string → number/boolean/date)
- **Search Queries**: Multi-field text search with case-insensitive matching

### Specific Repositories

Each model has its own repository with domain-specific methods:

#### UserRepository

- `findByEmail(email: string)`
- `findByIdWithSessions(id: string)`
- `findActiveUsers()`
- `searchUsers(searchTerm: string)`
- `getUserStats()`

#### OTPRepository

- `findByEmailAndPurpose(email: string, purpose: string)`
- `isOTPValid(email: string, code: string, purpose: string)`
- `markAsVerified(id: string)`
- `deleteExpiredOTPs()`

#### SessionRepository

- `findByToken(token: string)`
- `isSessionValid(token: string)`
- `findActiveSessions()`
- `extendSession(sessionId: string, newExpiryDate: Date)`

## 📖 Usage Examples

### Basic CRUD Operations

```typescript
import { RepositoryFactory } from "@core/infrastructure/Repository";

// Get repository factory from DI container
const repositoryFactory = container.resolve("repositoryFactory");
const { user } = repositoryFactory.getAllRepositories();

// Create a user
const newUser = await user.create({
  email: "john@example.com",
  first_name: "John",
  last_name: "Doe",
  password: "hashedPassword",
});

// Find user by ID
const userById = await user.findById("user-id");

// Find user by email
const userByEmail = await user.findByEmail("john@example.com");

// Update user
const updatedUser = await user.update("user-id", {
  first_name: "Jane",
});

// Delete user
await user.delete("user-id");
```

### Advanced Queries

```typescript
// Pagination
const paginatedUsers = await user.findManyPaginated(
  { first_name: "John" }, // where clause
  {
    pagination: { page: 1, limit: 10 },
    sort: [{ field: "created_at", direction: "desc" }],
  }
);

// Complex filtering
const filteredUsers = await user.findMany({
  first_name: "like:John", // contains "John"
  created_at: {
    gte: new Date("2024-01-01"), // created after date
    lte: new Date("2024-12-31"), // created before date
  },
  email: "endsWith:gmail.com", // email ends with gmail.com
});

// Search across multiple fields
const searchResults = await user.search("john", [
  "first_name",
  "last_name",
  "email",
]);

// Relations
const userWithSessions = await user.findByIdWithSessions("user-id");
```

### Using in Services

```typescript
import { BaseService } from "@core/application/base-service";
import { RepositoryFactory } from "@core/infrastructure/Repository";

export class UserService extends BaseService {
  constructor(repositoryFactory: RepositoryFactory) {
    super(repositoryFactory);
  }

  async createUser(userData: CreateUserInput) {
    // Validation
    this.validateRequired(userData, [
      "email",
      "first_name",
      "last_name",
      "password",
    ]);

    // Check if user exists
    const existingUser = await this.repositories.user.findByEmail(
      userData.email
    );
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    return await this.repositories.user.create({
      ...userData,
      password: hashedPassword,
    });
  }
}
```

### Using in Controllers with createRoutingController

```typescript
import { createRoutingController } from "@core/interfaces/rest/rest";
import { CreateUserDTO, UserParamsDTO } from "@core/application/dtos";

export function createUserController(repositoryFactory: RepositoryFactory) {
  const userService = new UserService(repositoryFactory);

  return createRoutingController("/users", {
    "/": ({ controller }) => ({
      post: controller({
        body: CreateUserDTO,
        handler: async ({ body }) => {
          const user = await userService.createUser(body);
          return {
            success: true,
            data: user,
            message: "User created successfully",
          };
        },
      }),
      get: controller({
        query: UserQueryDTO,
        handler: async ({ query }) => {
          const result = await userService.getUsersPaginated({}, query);
          return {
            success: true,
            data: result.data,
            pagination: result.pagination,
          };
        },
      }),
    }),

    "/:id": ({ controller }) => ({
      get: controller({
        params: UserParamsDTO,
        handler: async ({ params }) => {
          const user = await userService.getUserById(params.id);
          if (!user) throw new Error("User not found");
          return { success: true, data: user };
        },
      }),
    }),
  });
}
```

## 🔧 Query Builder Features

### String Operations

```typescript
// Contains
{
  name: "like:John";
} // WHERE name CONTAINS "John"

// Starts with
{
  email: "startsWith:admin";
} // WHERE email STARTS WITH "admin"

// Ends with
{
  email: "endsWith:gmail.com";
} // WHERE email ENDS WITH "gmail.com"

// Greater than
{
  age: "gt:18";
} // WHERE age > 18

// Greater than or equal
{
  age: "gte:18";
} // WHERE age >= 18

// Less than
{
  age: "lt:65";
} // WHERE age < 65

// Less than or equal
{
  age: "lte:65";
} // WHERE age <= 65

// Not equal
{
  status: "not:inactive";
} // WHERE status != "inactive"
```

### Array Operations

```typescript
// In array
{
  status: ["active", "pending"];
} // WHERE status IN ["active", "pending"]
```

### Nested Filters

```typescript
// Nested object filtering
{
  user: {
    email: "like:gmail.com",
    profile: {
      age: "gte:18"
    }
  }
}
```

## 🧪 Testing

Run the repository pattern tests:

```bash
npm run test:repositories
```

This will test all repository operations and demonstrate the pattern usage.

## 📝 DTOs

The repository pattern works with Zod DTOs for validation:

```typescript
// User DTOs
export const CreateUserDTO = z.object({
  email: z.string().email("Invalid email format"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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
  // ... other fields
});
```

## 🎯 Benefits

1. **Separation of Concerns**: Database logic is separated from business logic
2. **Reusability**: Common operations are abstracted in the base repository
3. **Type Safety**: Full TypeScript support with Prisma types
4. **Validation**: Built-in input validation with Zod
5. **Flexibility**: Easy to extend with custom methods
6. **Testing**: Easy to mock and test
7. **Consistency**: Standardized approach across all repositories
8. **Performance**: Optimized queries with pagination and filtering

## 🔄 Dependency Injection

The repositories are registered in the DI container:

```typescript
// In container.ts
container.register({
  userRepository: asClass(UserRepository).singleton(),
  otpRepository: asClass(OTPRepository).singleton(),
  sessionRepository: asClass(SessionRepository).singleton(),
  repositoryFactory: asClass(RepositoryFactory).singleton(),
});
```

Access repositories through the factory:

```typescript
const repositoryFactory = container.resolve("repositoryFactory");
const { user, otp, session } = repositoryFactory.getAllRepositories();
```

This pattern ensures clean, maintainable, and testable code while providing powerful database operation capabilities.
