Local database helper for cisb-referral

Commands:

- Start Postgres locally in docker-compose:
  npm run db:up
- Stop and remove volumes:
  npm run db:down
- Run Prisma migrate and generate client:
  npm run migrate
  npm run generate
- One-shot setup (start, migrate, generate):
  npm run setup

Note: ensure Docker is running locally.
