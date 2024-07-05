import { NotAuthenticatedError, ServerError, getSessionFromRequest, route } from "app/api";
import { User, getDb } from "app/api/db";
import type { NextRequest } from "next/server";

export const GET = route(async (req: NextRequest) => {
  const user = getSessionFromRequest(req);
  if (!user) throw new NotAuthenticatedError();
  const db = await getDb();
  const dbUser = await db.getRepository(User).findOneBy({ id: user.id });
  if (!dbUser) throw new ServerError(`Failed to find user with it ${user.id}`);
  return Response.json(dbUser.publicAuthenticated());
});
