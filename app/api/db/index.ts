import { unstable_noStore as noStore } from "next/cache";
import type { DataSourceOptions } from "typeorm";
import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

import { Email, Module, Notification, Release, User } from "./entities";

// Validate required environment variables to ensure TypeScript definitions are correct
function ensureEnvVar(name: keyof NodeJS.ProcessEnv) {
  if (!process.env[name])
    throw new Error(`Missing required environment variable ${name}`);
}

ensureEnvVar("DATABASE_URL");
ensureEnvVar("NEXT_PUBLIC_WEB_ROOT");
ensureEnvVar("JWT_SECRET");
ensureEnvVar("JWT_COOKIE_NAME");

export const connectionOptions: DataSourceOptions = {
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT!),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Email, Module, Notification, Release, User],
  namingStrategy: new SnakeNamingStrategy(),
};

const db = new DataSource(connectionOptions);

let dbInitialized = false;

async function getDb() {
  noStore();

  if (!dbInitialized) {
    await db.initialize();
    dbInitialized = true;
  }

  return db;
}

export * from "./entities";
export { getDb };
