import mysql2 from "mysql2/promise";

export const db = mysql2.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

export async function exec<T>(query: string, ...params: unknown[]): Promise<T[]> {
  const [rows] = await db.execute(query, params);
  return rows as T[];
}
