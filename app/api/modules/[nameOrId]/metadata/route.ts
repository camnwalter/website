import { MissingQueryParamError, route } from "app/api";
import * as modules from "app/api/modules";
import { getMetadata } from "app/api/modules/[nameOrId]/releases";
import Version from "app/api/Version";
import type { NextRequest } from "next/server";
import type { SlugProps } from "utils/next";

export const GET = route(async (req: NextRequest, { params }: SlugProps<"nameOrId">) => {
  const searchParams = req.nextUrl.searchParams;

  const modVersionStr = searchParams.get("modVersion");
  if (!modVersionStr) throw new MissingQueryParamError("modVersion");
  const modVersion = Version.parse(modVersionStr);

  const gameVersions = searchParams.get("gameVersions")?.split(",")?.map(Version.parse);
  if (!gameVersions || gameVersions.length === 0) throw new MissingQueryParamError("gameVersion");

  const result = await modules.getOne(params.nameOrId);
  if (!result) return new Response("Unknown module", { status: 404 });

  const matchingRelease = await modules.findMatchingRelease(result, modVersion, gameVersions);
  if (!matchingRelease) return new Response("No matching release found", { status: 404 });

  const buffer = await getMetadata(result, matchingRelease.id);
  return new Response(buffer?.toString("utf-8"), {
    headers: { "Content-Type": "application/json" },
  });
});
