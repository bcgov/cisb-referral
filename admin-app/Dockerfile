FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --prefer-offline --no-audit

COPY . .
RUN npm run build

FROM caddy:2.11.3-alpine

RUN apk add --no-cache ca-certificates

COPY --from=build /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
RUN caddy fmt --overwrite /etc/caddy/Caddyfile

EXPOSE 3000 3001
USER 1001
