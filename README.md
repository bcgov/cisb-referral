# CISB Referral Application


## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
  - [BC Gov Design System](https://github.com/bcgov/design-system) React components
  - React Query for data fetching
  - React Hook Form + Zod for form validation (referral app)
- **Backend**: NestJS 11 + TypeScript
  - Prisma ORM with PostgreSQL
  - Swagger API documentation
  - Winston logging
- **Database**: PostgreSQL with Prisma migrations

## Project Structure

```
cisb-referral/
├── admin-app/          # Admin portal (React)
├── referral-app/       # Public referral submission (React)
├── backend/            # REST API (NestJS + Prisma)
│   └── prisma/         # Database schema and migrations
└── docs/               # Documentation
```

## Prerequisites

- Node.js 18+
- PostgreSQL (local or Docker)
- npm

## Getting Started

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Set Up Database

```bash
cd backend
cp .env.example .env
# Edit .env with your database connection details
npm run prisma:migrate:dev   # Run Prisma migrations
npm run prisma:generate      # Generate Prisma client
npm run prisma:seed          # Seed initial data (optional)
```

### 3. Start Development Servers

```bash
# Start all services at once
npm run dev

# Or start individually:
npm run dev:admin      # Admin app: http://localhost:5173
npm run dev:referral   # Referral app: http://localhost:5174
npm run dev:backend    # Backend API: http://localhost:3000
```

## Available Scripts

| Command                | Description                           |
| ---------------------- | ------------------------------------- |
| `npm run install:all`  | Install dependencies for all packages |
| `npm run dev`          | Start all services concurrently       |
| `npm run dev:admin`    | Start admin frontend only             |
| `npm run dev:referral` | Start referral frontend only          |
| `npm run dev:backend`  | Start backend API only                |
| `npm run build`        | Build all applications for production |

## API Documentation

When running locally, Swagger documentation is available at:

- http://localhost:3000/api

## Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test locally
4. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
5. Push and create a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## Documentation

- [Database Schema](docs/database-schema.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [License](LICENSE)

## License

Apache 2.0 - See [LICENSE](LICENSE) for details.

## Support

For questions or issues:

- Create an issue in this repository

---
