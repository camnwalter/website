import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

import { Module, Release, User } from "./entities";

export const db = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: "website",
  entities: [Module, Release, User],
  namingStrategy: new SnakeNamingStrategy(),
  // synchronize: true,
});

if (!db.isInitialized) await db.initialize();

export type { PublicModule, PublicRelease, PublicUser } from "./entities";
export { Module, Release, User };
export { Sort } from "./entities";

// import { migrate } from "./migrate";
// await migrate();
// process.exit(0);
