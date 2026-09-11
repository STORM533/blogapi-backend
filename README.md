# Blog API

A RESTful API backend for a blogging platform. Supports user authentication, role-based access control, blog post management, and commenting.

## Tech Stack

- **Language**: TypeScript (strict mode, ESM)
- **Runtime**: Node.js
- **Framework**: Express 5
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: Passport.js (JWT + Local strategies), bcrypt
- **Security**: Helmet, CORS, express-rate-limit
- **Validation**: express-validator

## Project Structure

```
src/
  server.ts              # Entry point
  app.ts                 # Express app configuration
  controllers/           # Route handlers
    auth.controller.ts
    posts.controller.ts
    comments.controller.ts
  services/              # Business logic
    auth.service.ts
    posts.service.ts
    comments.service.ts
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
  types/                 # TypeScript type definitions
  lib/                   # Prisma client singleton
  errors/                # Custom error classes
prisma/
  schema.prisma          # Database schema
  migrations/            # Database migrations
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

   The server runs on `http://localhost:3000`.

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@localhost:5432/blog_api` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `your-secret-key` |
| `NODE_ENV` | Environment mode | `development` |

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start dev server with hot-reload |
| `build` | `npm run build` | Compile TypeScript to `dist/` |
| `start` | `npm start` | Run the production build |
| `lint` | `npm run lint` | Run ESLint |
| `lint:fix` | `npm run lint:fix` | Run ESLint with auto-fix |
| `format` | `npm run format` | Format code with Prettier |
| `format:check` | `npm run format:check` | Check formatting without writing |

## API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register a new user |
| POST | `/auth/login` | Login and receive a JWT token |

### Posts

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/posts` | Optional | - | List posts (published only for guests/users; all for authors) |
| GET | `/posts/:id` | Optional | - | Get a single post with comments |
| POST | `/posts` | Yes | AUTHOR | Create a new post |
| PATCH | `/posts/:id` | Yes | AUTHOR | Update a post |
| DELETE | `/posts/:id` | Yes | AUTHOR | Delete a post |
| PATCH | `/posts/:id/publish` | Yes | AUTHOR | Toggle publish status |

### Comments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/posts/:postId/comments` | Optional | Get comments for a post |
| POST | `/posts/:postId/comments` | Yes | Create a comment |
| PATCH | `/comments/:id` | Yes | Update own comment |
| DELETE | `/comments/:id` | Yes | Delete comment (owner or author) |

## Database Schema

- **User**: id, username, email, password, role (USER/AUTHOR), createdAt
- **Post**: id, title, content, published, timestamps, authorId
- **Comment**: id, content, timestamps, userId, postId

Cascade deletes are enabled: deleting a user removes their posts and comments; deleting a post removes its comments.
