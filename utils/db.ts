import mysql2 from "mysql2/promise";

// https://dev.to/noclat/fixing-too-many-connections-errors-with-database-clients-stacking-in-dev-mode-with-next-js-3kpm
const registerService = <T>(name: string, initFn: () => T): T => {
  if (process.env.NODE_ENV === "development") {
    if (!(name in global)) global[name] = initFn();
    return global[name];
  }
  return initFn();
};

export const db = registerService("db", () =>
  mysql2.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT!),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  }),
);

export async function exec<T>(query: string, ...params: unknown[]): Promise<T[]> {
  const [rows] = await db.execute(query, params);
  return rows as T[];
}
