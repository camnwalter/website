import { route } from "app/api";
import * as releases from "app/api/modules/[nameOrId]/releases";
import type { NextRequest } from "next/server";
import type { SlugProps } from "utils/next";

export const GET = route(
  async (req: NextRequest, { params }: SlugProps<"nameOrId" | "releaseId">) => {
    const buffer = await releases.getScripts(params.nameOrId as string, params.releaseId as string);
    if (!buffer) return new Response("Unknown module or release id", { status: 404 });
    return new Response(buffer, { headers: { "Content-Type": "application/zip" } });
  },
);
