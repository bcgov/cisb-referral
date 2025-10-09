# Contributing to CISB Referral Application

## How to Contribute

Government employees, public and members of the private sector are encouraged to contribute to the repository by forking and submitting a pull request.

(If you are new to GitHub, you might start with a [basic tutorial](https://help.github.com/articles/set-up-git) and check out a [more detailed guide to pull requests](https://help.github.com/articles/using-pull-requests/).)

Pull requests will be evaluated by the repository guardians on a schedule and if deemed beneficial will be committed to the main branch.

## Development Setup

1. Fork the repository
2. Clone your fork locally
3. Install dependencies:

   ```bash
   # Install all dependencies at once
   npm run install:all

   # Or install individually:
   # Admin frontend
   cd admin-app && npm install

   # Referral frontend
   cd referral-app && npm install

   # Backend API
   cd backend && npm install

   # Database utilities
   cd database && npm install
   ```

4. Set up the database:

   ```bash
   cd database
   cp .env.example .env
   # Edit .env with your database connection details
   npm run db:up        # Start PostgreSQL via Docker
   npm run db:migrate   # Run Prisma migrations
   npm run db:generate  # Generate Prisma client
   ```

5. Create a feature branch: `git checkout -b feature/your-feature-name`
6. Make your changes and test them
7. Run the test suite to ensure nothing is broken:
   ```bash
   npm test
   ```
8. Commit your changes using [Conventional Commits](https://www.conventionalcommits.org/) format
9. Push to your fork and submit a pull request

## Project Structure

- `admin-app/` - Admin portal (Vue 3 + Vite + TypeScript)
- `referral-app/` - Public referral submission (Vue 3 + Vite + TypeScript)
- `backend/` - REST API server (NestJS + TypeScript)
- `database/` - Database schema and migrations (Prisma + PostgreSQL)
- `docs/` - Project documentation

## Running the Application Locally

```bash
# Start all services concurrently
npm run dev

# Or run individually:
npm run dev:admin      # Admin app on port 5173
npm run dev:referral   # Referral app on port 5174
npm run dev:backend    # Backend API on port 3000
npm run dev:database   # PostgreSQL via Docker
```

## Pull Request Guidelines

- Use [Conventional Commits](https://www.conventionalcommits.org/) format for PR titles (e.g., `feat: add user authentication`, `fix: resolve form validation issue`)
- Provide a clear description of the changes in the PR body
- Include tests for new functionality
- Ensure all tests pass
- Follow the existing code style and formatting
- Update documentation as needed
- Reference any related issues in the PR description

## Code Style

### General

- Use 2 spaces for indentation
- Remove all trailing whitespace
- Use LF (Unix-style) line endings
- Write clear, self-documenting code
- Include JSDoc/TSDoc comments for public APIs

### Vue (Frontend)

- Use Composition API with `<script setup>` syntax
- Follow Vue 3 style guide
- Use TypeScript for type safety
- Keep components focused and single-purpose
- Use Pinia for state management

### NestJS (Backend)

- Follow NestJS best practices and conventions
- Use dependency injection
- Implement proper error handling
- Use DTOs for request/response validation
- Organize code into modules

### Prisma (Database)

- Write clear migration names
- Test migrations locally before committing
- Document schema changes in PR descriptions
- Use meaningful model and field names

## Testing

- Write unit tests for new functionality
- Maintain or improve test coverage
- Use the AAA pattern (Arrange-Act-Assert) for tests
- Test both happy paths and edge cases
- Ensure all tests pass before submitting

### Running Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests (when implemented)
cd admin-app && npm test
cd referral-app && npm test
```

## Security

- Never commit credentials or secrets
- Use environment variables for sensitive configuration
- Follow BC Government security standards
- Validate all user inputs on both client and server
- Use parameterized queries (Prisma handles this automatically)
- Implement proper authentication and authorization
- Keep dependencies up to date

## Database Migrations

When making schema changes:

1. Update `database/prisma/schema.prisma`
2. Create a migration: `cd database && npm run db:migrate`
3. Test the migration locally
4. Commit both the schema and migration files
5. Document breaking changes in the PR

## Authentication

- This application uses Keycloak for authentication
- Separate Keycloak instances for admin and referral apps
- Never bypass authentication in production code
- Test auth flows thoroughly

## Documentation

- Update relevant documentation when making changes
- Keep README files current
- Document API endpoints and data models
- Add inline comments for complex logic

## License

All contributors retain the original copyright to their stuff, but by contributing to this project, you grant a world-wide, royalty-free, perpetual, irrevocable, non-exclusive, transferable license to all users under the terms of the [Apache License 2.0](LICENSE) under which this project is distributed.
