# CISB Referral Backend

REST API for the CISB Referral system, serving both the admin and referral frontend apps.

## Tech Stack

- NestJS 11 + TypeScript
- Prisma ORM with PostgreSQL
- Passport + Keycloak JWT authentication
- Swagger API documentation
- Winston logging
- Jest for testing

## Getting Started

```bash
npm install
cp .env.example .env
# Edit .env with your database connection details
npm run prisma:migrate:dev
npm run start:dev
```

API runs on [http://localhost:3000](http://localhost:3000). Swagger docs at [http://localhost:3000/api](http://localhost:3000/api).

## Available Scripts

| Command                         | Description                     |
| ------------------------------- | ------------------------------- |
| `npm run start:dev`             | Start in watch mode             |
| `npm run start:debug`           | Start in debug + watch mode     |
| `npm run start:prod`            | Start production build          |
| `npm run build`                 | Compile the project             |
| `npm run lint`                  | Lint and fix source files       |
| `npm run format`                | Format with Prettier            |
| `npm test`                      | Run unit tests                  |
| `npm run test:watch`            | Run tests in watch mode         |
| `npm run test:cov`              | Run tests with coverage         |
| `npm run test:e2e`              | Run end-to-end tests            |
| `npm run prisma:generate`       | Generate Prisma client          |
| `npm run prisma:migrate:dev`    | Create and apply dev migrations |
| `npm run prisma:migrate:deploy` | Apply migrations in production  |
| `npm run prisma:studio`         | Open Prisma Studio              |

## Project Structure

```
src/
├── agency-types/    # Agency type CRUD module
├── auth/            # JWT/Keycloak authentication
├── common/          # Shared utilities and decorators
├── contacts/        # External contact management
├── generated/       # Prisma generated client
├── middleware/      # HTTP middleware (logging, etc.)
├── ministries/      # Ministry CRUD module
├── prisma/          # Prisma service
├── referrals/       # Referral CRUD module
├── regions/         # Region CRUD module
└── users/           # User management module
```
