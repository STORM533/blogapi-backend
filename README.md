# Blog API

A RESTful API backend for a blogging platform. Supports user authentication, role-based access control, blog post management, and commenting.

## Tech Stack

- **Language**: TypeScript (strict mode, ESM)
- **Runtime**: Node.js
- **Framework**: Express 5
- **Database**: PostgreSQL
- **ORM**: Prisma (with `@prisma/adapter-pg`)
- **Auth**: Passport.js (JWT + Local strategies), bcrypt, jsonwebtoken
- **Security**: Helmet, CORS, express-rate-limit
- **Testing**: Vitest + SuperTest (integration tests against a dedicated `test_blog_api` PostgreSQL database)
- **Validation**: express-validator
- **Other**: cookie-parser (HTTP-only JWT cookies), dotenv, tsx (dev runner)

## Project Structure

```bash
src/
  server.ts              # Entry point
  app.ts                 # Express app configuration
  controllers/           # Route handlers
    auth.controller.ts
    posts.controller.ts
    comments.controller.ts
    users.controller.ts
  services/              # Business logic
    auth.service.ts
    posts.service.ts
    comments.service.ts
    users.service.ts
  middleware/             # Auth, validation, error handling
    auth.ts
    authorize.ts
    commentAuth.ts
    optionalAuth.ts
    errorHandler.ts
    rateLimiter.ts
    validateRequest.ts
    asyncHandler.ts
  routes/                # Route definitions
    auth.routes.ts
    posts.routes.ts
    comments.routes.ts
    users.routes.ts
  types/                 # TypeScript type definitions
  lib/                   # Prisma client singleton
  errors/                # Custom error classes (AppError)
  generated/             # Prisma generated client
prisma/
  schema.prisma          # Database schema
  migrations/            # Database migrations
tests/
  setup.ts               # Test env bootstrap (NODE_ENV=test before app imports)
  helpers/               # DB reset, factories, JWT auth, supertest app
  unit/                  # Middleware tests (mocked req/res, no DB)
  integration/           # Full-stack route tests (supertest → Prisma → PostgreSQL)
scripts/
  setup-test-db.mjs      # Create + migrate the test database
postman/                 # API test collection
```

## Prerequisites

- Node.js (v18+)
- PostgreSQL

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root (see [Environment Variables](#environment-variables)).

3. Run Prisma migrations:

   ```bash
   npx prisma migrate dev
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   The server runs on `http://localhost:3000` by default.

## Environment Variables

| Variable             | Description                                                              | Example                                                   |
| -------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------- |
| `DATABASE_URL`       | PostgreSQL connection string                                             | `postgresql://user:password@localhost:5432/dbname`        |
| `TEST_DATABASE_URL`  | Test database URL (`NODE_ENV=test`); `.env` is gitignored — add manually | `postgresql://user:password@localhost:5432/test_blog_api` |
| `JWT_SECRET`         | Secret key for signing JWT tokens                                        | `your-secret-key`                                         |
| `NODE_ENV`           | Environment mode                                                         | `development`                                             |
| `PORT`               | Server listening port                                                    | `3000` (default)                                          |
| `CORS_ORIGIN_USER`   | Allowed CORS origin for user app                                         | `http://localhost:5173`                                   |
| `CORS_ORIGIN_AUTHOR` | Allowed CORS origin for author app                                       | `http://localhost:5174`                                   |

## Available Scripts

| Script          | Command                 | Description                                 |
| --------------- | ----------------------- | ------------------------------------------- |
| `dev`           | `npm run dev`           | Start dev server with hot-reload            |
| `build`         | `npm run build`         | Compile TypeScript to `dist/`               |
| `start`         | `npm start`             | Run the production build                    |
| `lint`          | `npm run lint`          | Run ESLint                                  |
| `lint:fix`      | `npm run lint:fix`      | Run ESLint with auto-fix                    |
| `format`        | `npm run format`        | Format code with Prettier                   |
| `format:check`  | `npm run format:check`  | Check formatting without writing            |
| `test`          | `npm test`              | Run all tests once (Vitest)                 |
| `test:watch`    | `npm run test:watch`    | Run tests in watch mode                     |
| `test:coverage` | `npm run test:coverage` | Run tests with a coverage report (no gates) |
| `test:db:setup` | `npm run test:db:setup` | Create and migrate the test database        |

## Testing

Tests use [Vitest](https://vitest.dev/) + [SuperTest](https://github.com/ladjs/supertest) against the exported Express app (`src/app.ts`) — the server entry (`src/server.ts`) is never started during tests.

### Requirements

- A running PostgreSQL instance reachable at `localhost:5432` (host service or Docker).
- A dedicated test database — tests **never** fall back to `DATABASE_URL`.

### Environment variables

`.env` is gitignored, so add the test database URL manually:

```properties
TEST_DATABASE_URL=postgresql://storm:STORM@localhost:5432/test_blog_api
```

| Variable            | Used when       | Purpose                                    |
| ------------------- | --------------- | ------------------------------------------ |
| `TEST_DATABASE_URL` | `NODE_ENV=test` | Connection string for `test_blog_api`      |
| `DATABASE_URL`      | otherwise       | Development/production database            |
| `JWT_SECRET`        | always          | Signs/verifies tokens in integration tests |

`NODE_ENV=test` is enforced by `tests/setup.ts` before any application module loads, so `src/lib/prisma.ts` always selects `TEST_DATABASE_URL` in tests.

### One-time setup

```bash
npm run test:db:setup   # CREATE DATABASE test_blog_api + prisma migrate deploy
```

The script fails immediately if `TEST_DATABASE_URL` is missing.

### Running tests

```bash
npm test                # full suite, once
npm run test:watch      # watch mode
npm run test:coverage   # coverage report (no thresholds enforced)
```

### Test database behavior

- **Name**: `test_blog_api` (prefixed `test_` to distinguish it from real databases).
- **Reset**: every integration test starts from `resetDb()` — a `$transaction` that wipes `Comment`, `Post`, and `User` rows, so no test depends on another.
- **Sequential**: test files run one after another (`fileParallelism: false`) because the suites share one database.
- **Isolation**: tests live in `tests/` (outside `src/`), so they never enter the production build (`rootDir: "./src"`).

### Layout

```
tests/
  setup.ts            # loads .env, forces NODE_ENV=test (before app imports)
  helpers/            # db reset, factories (direct Prisma writes), JWT auth, supertest app
  unit/               # middleware tests with mocked req/res (no DB)
  integration/        # full-stack: supertest → middleware → services → Prisma → PostgreSQL
```

## API Endpoints

### Auth

| Method | Endpoint       | Description                   |
| ------ | -------------- | ----------------------------- |
| POST   | `/auth/signup` | Register a new user           |
| POST   | `/auth/login`  | Login and receive a JWT token |
| POST   | `/auth/logout` | Clear JWT cookie              |

### Posts

| Method | Endpoint             | Auth     | Role   | Description                                                   |
| ------ | -------------------- | -------- | ------ | ------------------------------------------------------------- |
| GET    | `/posts`             | Optional | -      | List posts (published only for guests/users; all for authors) |
| GET    | `/posts/stats`       | Yes      | AUTHOR | Get post statistics (total, published, drafts, comments)      |
| GET    | `/posts/:id`         | Optional | -      | Get a single post with comments                               |
| POST   | `/posts`             | Yes      | AUTHOR | Create a new post                                             |
| PATCH  | `/posts/:id`         | Yes      | AUTHOR | Update a post                                                 |
| DELETE | `/posts/:id`         | Yes      | AUTHOR | Delete a post                                                 |
| PATCH  | `/posts/:id/publish` | Yes      | AUTHOR | Toggle publish status                                         |

### Comments

| Method | Endpoint                  | Auth     | Description                      |
| ------ | ------------------------- | -------- | -------------------------------- |
| GET    | `/posts/:postId/comments` | Optional | Get comments for a post          |
| POST   | `/posts/:postId/comments` | Yes      | Create a comment                 |
| PATCH  | `/comments/:id`           | Yes      | Update own comment               |
| DELETE | `/comments/:id`           | Yes      | Delete comment (owner or author) |

### Users

| Method | Endpoint       | Auth | Description                                  |
| ------ | -------------- | ---- | -------------------------------------------- |
| GET    | `/me`          | Yes  | Get the current authenticated user's profile |
| GET    | `/me/comments` | Yes  | Get the current user's comments (paginated)  |

## Database Schema

- **User**: id, username (`@unique`), email (`@unique`), password, role (USER/AUTHOR), createdAt
- **Post**: id, title, content, published, timestamps, authorId
- **Comment**: id, content, timestamps, userId, postId

Cascade deletes are enabled: deleting a user removes their posts and comments; deleting a post removes its comments.

## Frontend

See [blogapi-frontend](https://github.com/STORM533/blogapi-frontend) for the React frontend (user app + author dashboard).
