import { unstable_noStore as noStore } from "next/cache";
import type { DataSourceOptions } from "typeorm";
import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

import { Email, Module, Notification, Release, User } from "./entities";

export const connectionOptions: DataSourceOptions = {
  type: "mysql",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Email, Module, Notification, Release, User],
  namingStrategy: new SnakeNamingStrategy(),
};

const db = new DataSource(connectionOptions);

let dbInitialized = false;

// Note: This function really should be async, since db.initialize() returns a promise, however
//       making every callsite use await (await db()).getRepository(...) is pretty bad. Instead,
//       we accept the fact that the first load after the server starts will throw an error.
function getDb() {
  noStore();

  if (!dbInitialized) {
    dbInitialized = true;
    db.initialize();
  }

  return db;
}

export * from "./entities";
export { getDb as db };
