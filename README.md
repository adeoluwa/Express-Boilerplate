# 🚀 Backend Setup - Modern Node.js API Boilerplate

Josh here😄, this is a  robust, production-ready Node.js backend boilerplate built with TypeScript, Express, Prisma, and modern architectural patterns. Perfect for quickly starting new projects with authentication, user management, and scalable architecture.

## ✨ Features

- 🔐 **Complete Authentication System** - JWT-based auth with session management
- 👤 **User Management** - Full CRUD operations with validation
- 📱 **OTP System** - Email/SMS verification with Twilio integration
- 🗄️ **Database Layer** - Prisma ORM with SQLite (easily switchable to PostgreSQL)
- 🏗️ **Clean Architecture** - Modular design with dependency injection
- 🔄 **Auto-Loading** - Automatic service and controller registration
- 📝 **Type Safety** - Full TypeScript support with Zod validation
- 🛡️ **Security** - Helmet, CORS, input validation, and sanitization
- 📊 **Logging** - Structured logging with Pino
- 🧪 **Testing Ready** - Repository pattern for easy testing
- 📧 **Notifications** - Email (Nodemailer) and SMS (Twilio) support

## 🏗️ Project Structure

```
backend-setup/
├── 📁 src/
│   ├── 📁 core/                    # Core application logic
│   │   ├── 📁 application/         # Application services & DTOs
│   │   │   ├── base-service.ts     # Base service class
│   │   │   └── dtos.ts            # Data Transfer Objects
│   │   ├── 📁 config/             # Configuration management
│   │   │   ├── app.ts             # App configuration
│   │   │   ├── database.ts        # Database config
│   │   │   ├── google.ts          # Google OAuth config
│   │   │   ├── notification.ts    # Notification config
│   │   │   ├── server.ts          # Server configuration
│   │   │   └── twilio.ts          # Twilio SMS config
│   │   ├── 📁 container/          # Dependency injection
│   │   │   ├── attach.ts          # Container attachment
│   │   │   ├── container.ts       # Container setup
│   │   │   └── loader.ts          # Auto-loading system
│   │   ├── 📁 infrastructure/     # External concerns
│   │   │   ├── 📁 database/       # Database layer
│   │   │   │   ├── prisma.ts      # Prisma client
│   │   │   │   └── testDB.ts      # DB connection test
│   │   │   ├── 📁 notification/   # Notification services
│   │   │   │   ├── 📁 email/      # Email service
│   │   │   │   └── 📁 sms/        # SMS service
│   │   │   └── 📁 Repository/     # Data access layer
│   │   │       ├── base.repository.ts      # Base repository
│   │   │       ├── base.repository.interface.ts
│   │   │       ├── query-builder.ts        # Query utilities
│   │   │       └── index.ts               # Repository exports
│   │   ├── 📁 interfaces/         # External interfaces
│   │   │   ├── 📁 graphql/        # GraphQL (future)
│   │   │   └── 📁 rest/           # REST API
│   │   │       ├── loadControllers.ts     # Controller loader
│   │   │       └── rest.ts               # REST utilities
│   │   ├── 📁 server/             # Server setup
│   │   │   ├── app.ts             # Express app configuration
│   │   │   └── server-shutdown.ts # Graceful shutdown
│   │   └── 📁 utils/              # Core utilities
│   │       ├── currency.ts        # Currency utilities
│   │       └── HttpStatusCode.ts  # HTTP status codes
│   ├── 📁 modules/                # Feature modules
│   │   ├── 📁 auth/               # Authentication module
│   │   │   ├── auth.controller.ts # Auth endpoints
│   │   │   ├── auth.service.ts    # Auth business logic
│   │   │   ├── session.repository.ts # Session management
│   │   │   └── index.ts           # Module exports
│   │   ├── 📁 user/               # User management module
│   │   │   ├── user.controller.ts # User endpoints
│   │   │   ├── user.service.ts    # User business logic
│   │   │   ├── user.repository.ts # User data access
│   │   │   └── index.ts           # Module exports
│   │   ├── 📁 otp/                # OTP verification module
│   │   │   ├── otp.service.ts     # OTP business logic
│   │   │   ├── otp.repository.ts  # OTP data access
│   │   │   └── index.ts           # Module exports
│   │   ├── 📁 admin/              # Admin module (empty)
│   │   ├── 📁 disputes/           # Disputes module (empty)
│   │   └── 📁 vendor/             # Vendor module (empty)
│   ├── 📁 shared/                 # Shared utilities
│   │   ├── 📁 constants/          # Application constants
│   │   ├── 📁 errors/             # Custom error classes
│   │   ├── 📁 logger/             # Logging configuration
│   │   ├── 📁 types/              # TypeScript types
│   │   └── 📁 utils/              # Shared utilities
│   └── index.ts                   # Application entry point
├── 📁 prisma/                     # Database schema & migrations
│   ├── schema.prisma              # Database schema
│   ├── dev.db                     # SQLite database file
│   └── 📁 migrations/             # Database migrations
├── 📁 env/                        # Environment files
│   ├── development.env            # Development environment
│   └── sample.env                 # Environment template
├── package.json                   # Dependencies & scripts
├── tsconfig.json                  # TypeScript configuration
├── nodemon.json                   # Development server config
└── README.md                      # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd backend-setup
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   ```bash
   cp env/sample.env env/development.env
   # Edit env/development.env with your configuration
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run database migrations
   npm run prisma:migrate
   ```

5. **Start the development server**
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:8008`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory or use the provided environment files:

```env
# Application
APP_ENV=development
APP_NAME=YourAppName
APP_VERSION=1.0.0

# Database
DATABASE_URL="file:./dev.db"  # SQLite (development)
# DATABASE_URL="postgresql://user:password@localhost:5432/dbname"  # PostgreSQL (production)

# Server
PORT=8008
JWT_SECRET=your-jwt-secret
SECRET_KEY=your-secret-key

# Twilio (for SMS)
TWILIO_SID=your-twilio-sid
TWILIO_TOKEN=your-twilio-token
TWILIO_SOURCE_NUMBER=your-twilio-number

# Google OAuth (optional)
GOOGLE_WEB_CLIENT_ID=your-google-client-id
```

### Database Configuration

The project uses Prisma ORM with SQLite by default. To switch to PostgreSQL:

1. Update `DATABASE_URL` in your environment file
2. Change the provider in `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Run migrations: `npm run prisma:migrate`

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint         | Description       | Body                                         |
| ------ | ---------------- | ----------------- | -------------------------------------------- |
| POST   | `/auth/register` | Register new user | `{ email, first_name, last_name, password }` |
| POST   | `/auth/login`    | User login        | `{ email, password }`                        |
| POST   | `/auth/logout`   | User logout       | `{ token }`                                  |
| POST   | `/auth/verify`   | Verify JWT token  | `{ token }`                                  |

### User Management Endpoints

| Method | Endpoint              | Description         | Parameters                                        |
| ------ | --------------------- | ------------------- | ------------------------------------------------- |
| GET    | `/users/active`       | Get active users    | -                                                 |
| GET    | `/users/stats`        | Get user statistics | -                                                 |
| GET    | `/users/:id`          | Get user by ID      | `id`                                              |
| PUT    | `/users/:id`          | Update user         | `id`, body: `{ first_name?, last_name?, email? }` |
| DELETE | `/users/:id`          | Delete user         | `id`                                              |
| GET    | `/users/:id/sessions` | Get user sessions   | `id`                                              |

### Example API Usage

```bash
# Register a new user
curl -X POST http://localhost:8008/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "password": "securepassword123"
  }'

# Login
curl -X POST http://localhost:8008/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'

# Get user stats
curl -X GET http://localhost:8008/users/stats
```

## 🏛️ Architecture

### Clean Architecture Principles

The project follows clean architecture principles with clear separation of concerns:

- **Controllers** - Handle HTTP requests and responses
- **Services** - Contain business logic
- **Repositories** - Handle data access
- **Infrastructure** - External concerns (database, notifications)

### Dependency Injection

The project uses Awilix for dependency injection with automatic service discovery:

```typescript
// Services are automatically registered and can be resolved
const authService = ctx.scope.resolve("authService") as AuthService;
const userRepository = ctx.scope.resolve("userRepository") as UserRepository;
```

### Repository Pattern

All data access goes through repositories that extend a base repository:

```typescript
export class UserRepository extends BaseRepository<
  User,
  UserCreateInput,
  UserUpdateInput,
  UserWhereInput
> {
  // Custom user-specific methods
  async findByEmail(email: string): Promise<User | null> {
    return this.findFirst({ email });
  }
}
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run start:dev          # Start development server with hot reload
npm run build              # Build for production
npm run start              # Start production server

# Database
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run database migrations
npm run prisma:studio      # Open Prisma Studio
npm run prisma:reset       # Reset database and run seed
npm run prisma:seed        # Run database seed

# Testing
npm run test:repositories  # Test repository pattern
```

### Adding New Modules

1. Create a new folder in `src/modules/`
2. Add your controller, service, and repository files
3. Create an `index.ts` file that exports all components:
   ```typescript
   export * from "./your-service";
   export * from "./your-controller";
   export * from "./your-repository";
   ```
4. The auto-loader will automatically discover and register your module

### Adding New Endpoints

Controllers use a clean, declarative pattern:

```typescript
export default function createYourController() {
  return createRoutingController("/your-endpoint", {
    "/action": ({ controller }) => ({
      post: controller({
        body: YourDTO,
        handler: async ({ ctx, body }) => {
          const result = await (
            ctx.scope.resolve("yourService") as YourService
          ).doSomething(body);
          return { success: true, data: result };
        },
      }),
    }),
  });
}
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for password security
- **Input Validation** - Zod schemas for request validation
- **CORS Protection** - Configurable CORS settings
- **Helmet** - Security headers in production
- **Input Sanitization** - Automatic input cleaning
- **Session Management** - Secure session handling

## 📊 Database Schema

The project includes three main entities:

### User Model

```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  first_name    String
  last_name     String
  password      String
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
  Session       Session[]
}
```

### Session Model

```prisma
model Session {
  id          String   @id @default(uuid())
  user_id     String
  token       String   @unique
  created_at  DateTime @default(now())
  expires_at  DateTime
  user        User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
}
```

### OTP Model

```prisma
model OTP {
  id          String     @id @default(uuid())
  email       String     @unique
  code        String
  purpose     String
  status      OTPStatus  @default(PENDING)
  created_at  DateTime   @default(now())
}
```

## 🚀 Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Setup

1. Set `NODE_ENV=production`
2. Configure production database URL
3. Set secure JWT secrets
4. Configure notification services (Twilio, email)

### Docker Support (Optional)

You can easily containerize this application:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 8008
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Joseph Adeoluwa O.**

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Web framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Awilix](https://github.com/jeffijoe/awilix) - Dependency injection
- [Zod](https://zod.dev/) - Schema validation

---

**Happy Coding! 🚀**
