import { getSessionFromRoute, route } from "app/api";
import type { NextRequest } from "next/server";

export const GET = route(async (req: NextRequest) => {
  const user = getSessionFromRoute(req);
  if (!user) return new Response("Not logged in", { status: 401 });
  return Response.json(user);
});
