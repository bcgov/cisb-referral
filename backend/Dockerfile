FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npm ci --prefer-offline --no-audit

COPY . .
RUN npx prisma generate
RUN npm run build

# Preserve prisma CLI for database migrations before pruning dev dependencies
RUN cp -r node_modules/prisma /tmp/prisma-cli
RUN npm prune --omit=dev
RUN cp -r /tmp/prisma-cli node_modules/prisma

FROM node:24-alpine
WORKDIR /app

ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma/
COPY --from=build /app/prisma.config.ts ./

EXPOSE 3000
USER 1001
CMD ["node", "dist/main"]