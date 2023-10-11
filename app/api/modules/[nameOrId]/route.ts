import { route } from "app/api";
import * as modules from "app/api/modules";
import type { NextRequest } from "next/server";
import type { SlugProps } from "utils/next";

export default route(async (req: NextRequest, { params }: SlugProps<"nameOrId">) => {
  const result = await modules.getOnePublic(params.nameOrId);
  if (result) return Response.json(result);
  return new Response(null, { status: 404 });
});
