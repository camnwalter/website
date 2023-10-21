import { getSessionFromRequest, NotAuthenticatedError, route } from "app/api";
import type { NextRequest } from "next/server";

export const GET = route(async (req: NextRequest) => {
  const user = getSessionFromRequest(req);
  if (!user) throw new NotAuthenticatedError();
  return Response.json(user);
});
