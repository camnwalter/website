import { route } from "app/api";
import * as modules from "app/api/modules";
import type { NextRequest } from "next/server";

export const GET = route(async (req: NextRequest) => {
  return Response.json(await modules.getManyPublic(req.nextUrl.searchParams));
});

// TODO: POST
