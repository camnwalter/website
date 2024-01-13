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
  // synchronize: true,
};

export const db = new DataSource(connectionOptions);

let dbInitialized = false;
if (!dbInitialized) {
  dbInitialized = true;
  await db.initialize();
}

export type * from "./entities";
export { EmailType, Rank, Sort } from "./entities";
export { Email, Module, Notification, Release, User };

// import { migrate } from "./migrate";
// await migrate();
// process.exit(0);
