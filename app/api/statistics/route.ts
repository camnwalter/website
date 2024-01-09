import { route } from "app/api";
import { db, Module, Release } from "app/api/db";

interface Stats {
  moduleCount: number;
  releaseCount: number;
  totalImports: number;
}

export async function getStats(): Promise<Stats> {
  const moduleCount = await db.getRepository(Module).count();
  const releaseCount = await db.getRepository(Release).count();
  const totalImports = (
    await db
      .getRepository(Release)
      .createQueryBuilder()
      .select("sum(downloads)", "total_downloads")
      .execute()
  )[0].total_downloads;

  return {
    moduleCount,
    releaseCount,
    totalImports: parseInt(totalImports),
  };
}

export const GET = route(async () => {
  const stats = await getStats();
  return Response.json({
    module_count: stats.moduleCount,
    release_count: stats.releaseCount,
    total_imports: stats.totalImports,
  });
});
