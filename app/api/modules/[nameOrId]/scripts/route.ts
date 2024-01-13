import type { SlugProps } from "app/(utils)/next";
import { BadQueryParamError, MissingQueryParamError, NotFoundError, route } from "app/api";
import Version from "app/api/(utils)/Version";
import * as modules from "app/api/modules";
import { getScripts } from "app/api/modules/[nameOrId]/releases";
import type { NextRequest } from "next/server";

export const GET = route(async (req: NextRequest, { params }: SlugProps<"nameOrId">) => {
  const searchParams = req.nextUrl.searchParams;

  const modVersionStr = searchParams.get("modVersion");
  if (!modVersionStr) throw new MissingQueryParamError("modVersion");
  const modVersion = Version.parse(modVersionStr);
  if (!modVersion) throw new BadQueryParamError("modVersion", modVersionStr);

  const gameVersions = searchParams
    .get("gameVersions")
    ?.split(",")
    ?.map(str => {
      const v = Version.parse(str);
      if (!v) throw new BadQueryParamError("gameVersions", str);
      return v;
    });

  if (!gameVersions || gameVersions.length === 0) throw new MissingQueryParamError("gameVersion");

  const existingModule = await modules.getOne(params.nameOrId);
  if (!existingModule) throw new NotFoundError("Module not found");

  const matchingRelease = await modules.findMatchingRelease(
    existingModule,
    modVersion,
    gameVersions,
  );
  if (!matchingRelease) throw new NotFoundError("Release not found");

  const buffer = await getScripts(existingModule, matchingRelease.id);
  return new Response(buffer?.toString("utf-8"), {
    headers: { "Content-Type": "application/zip" },
  });
});
