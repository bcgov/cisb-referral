# CISB Referral Application

A multi-tenant application for managing referrals with separate admin and public-facing portals.

## Tech Stack

- **Frontend**: Vue 3 + TypeScript + Vite
  - Admin portal (`/admin`)
  - Public referral submission (`/referral`)
- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Keycloak (separate instances for admin and referral)

## Project Structure

```
cisb-referral/
├── admin-app/          # Admin portal (Vue 3)
├── referral-app/       # Public referral submission (Vue 3)
├── backend/            # REST API (NestJS)
├── database/           # Database schema and migrations (Prisma)
└── docs/               # Documentation
```

## Prerequisites

- Node.js 18+
- Docker Desktop (for local PostgreSQL)
- npm or pnpm

## Getting Started

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Set Up Database

```bash
cd database
cp .env.example .env
# Edit .env with your database connection details
npm run db:up        # Start PostgreSQL via Docker
npm run db:migrate   # Run Prisma migrations
npm run db:generate  # Generate Prisma client
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
| `npm run dev:database` | Start PostgreSQL only                 |
| `npm run build`        | Build all applications for production |
| `npm run bootstrap`    | Set up database for first-time use    |

## Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test locally
4. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
5. Push and create a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## Documentation

- [Contributing Guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [License](LICENSE)
- Additional docs in `/docs` directory

## License

Apache 2.0 - See [LICENSE](LICENSE) for details.

## Support

For questions or issues:

- Create an issue in this repository

---
