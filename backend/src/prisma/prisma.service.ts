import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

/**
 * Database connection configuration
 */
const DB_HOST = process.env.POSTGRES_HOST || 'localhost';
const DB_USER = process.env.POSTGRES_USER || 'postgres';
const DB_PWD = encodeURIComponent(process.env.POSTGRES_PASSWORD || 'default');
const DB_PORT = process.env.POSTGRES_PORT || 5432;
const DB_NAME = process.env.POSTGRES_DATABASE || 'postgres';
const DB_SCHEMA = process.env.POSTGRES_SCHEMA || 'users';
const PGBOUNCER_URL = process.env.PGBOUNCER_URL;

/**
 * Build connection string based on environment
 * - If PGBOUNCER_URL is set (production), use it with pgbouncer=true flag
 * - Otherwise, build URL from individual components (local development)
 */
const dataSourceURL = PGBOUNCER_URL
  ? `${PGBOUNCER_URL}?schema=${DB_SCHEMA}&pgbouncer=true`
  : `postgresql://${DB_USER}:${DB_PWD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=${DB_SCHEMA}&connection_limit=5`;

/**
 * PrismaService - NestJS injectable database service
 *
 * Key features:
 * - Singleton pattern: Ensures only one PrismaClient instance exists
 * - Connection pooling: Uses pg.Pool for efficient connection management
 * - Lifecycle hooks: Connects on init, disconnects on destroy
 *
 * Prisma 7 requires a driver adapter (PrismaPg) instead of the built-in
 * query engine. This gives us direct control over the connection pool.
 */
@Injectable()
class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private logger = new Logger('PRISMA');

  /** Singleton instance - prevents multiple PrismaClient instances */
  private static instance: PrismaService;

  /** Node-postgres connection pool - managed separately for cleanup */
  private pool: Pool;

  constructor() {
    // Return existing instance if already created (singleton pattern)
    // This prevents connection pool exhaustion from multiple instances
    if (PrismaService.instance) {
      return PrismaService.instance;
    }

    // Create node-postgres connection pool
    // Pool manages multiple connections and handles reconnection automatically
    const pool = new Pool({ connectionString: dataSourceURL });

    // PrismaPg adapter bridges Prisma to the pg pool
    // This replaces Prisma's built-in Rust query engine with node-postgres
    const adapter = new PrismaPg(pool);

    // Initialize PrismaClient with the adapter
    super({ adapter });

    this.pool = pool;
    PrismaService.instance = this;
  }

  /**
   * NestJS lifecycle hook - called when module initializes
   */
  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connection established');
  }

  /**
   * NestJS lifecycle hook - called when application shuts down
   * Ensures clean disconnection from database
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}

export { PrismaService };
export { PrismaService };
