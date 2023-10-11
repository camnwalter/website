import { route } from "app/api";
import { db, Module, Release, User } from "app/api/db";

export const GET = route(async () => {
  // TODO: There's probably a way to do all of this in one query (there is for raw SQL)
  const module_count = await db.getRepository(Module).count();
  const release_count = await db.getRepository(Release).count();
  const user_count = await db.getRepository(User).count();
  const total_downloads = (
    await db
      .getRepository(Release)
      .createQueryBuilder()
      .select("sum(downloads)", "total_downloads")
      .execute()
  )[0].total_downloads;

  return Response.json({
    module_count,
    release_count,
    user_count,
    total_downloads: parseInt(total_downloads),
  });
});
