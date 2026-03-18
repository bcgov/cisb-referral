# CISB Referral App

Public-facing referral submission portal for the CISB Referral system.

## Tech Stack

- React 19 + TypeScript + Vite
- [BC Gov Design System](https://github.com/bcgov/design-system) React components
- React Hook Form + Zod for form validation
- React Query (`@tanstack/react-query`) for data fetching
- React Router for navigation
- Keycloak for authentication
- Vitest + Testing Library for tests

## Getting Started

```bash
npm install
npm run dev
```

Runs on [http://localhost:5174](http://localhost:5174) by default.

## Available Scripts

| Command                 | Description                   |
| ----------------------- | ----------------------------- |
| `npm run dev`           | Start dev server with HMR     |
| `npm run build`         | Type-check and build for prod |
| `npm run preview`       | Preview production build      |
| `npm run lint`          | Run ESLint                    |
| `npm test`              | Run tests in watch mode       |
| `npm run test:run`      | Run tests once                |
| `npm run test:coverage` | Run tests with coverage       |
