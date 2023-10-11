import { MissingQueryParamError, route } from "app/api";
import * as modules from "app/api/modules";
import * as releases from "app/api/modules/[nameOrId]/releases";
import Version from "app/api/Version";
import type { NextRequest } from "next/server";
import type { SlugProps } from "utils/next";

export const GET = route(async (req: NextRequest, { params }: SlugProps<"nameOrId">) => {
  const searchParams = req.nextUrl.searchParams;
  const modVersionStr = searchParams.get("modVersion");
  if (!modVersionStr) throw new MissingQueryParamError("modVersion");

  const modVersion = Version.parse(modVersionStr);

  const result = await modules.getOne(params.nameOrId);
  if (!result) return new Response("Unknown module", { status: 404 });

  result.releases.sort((r1, r2) => {
    const releaseComparison = Version.compareTwo(r1.release_version, r2.release_version);
    if (releaseComparison !== 0) return releaseComparison;
    return Version.compareTwo(r1.mod_version, r2.mod_version);
  });

  for (const release of result.releases) {
    if (Version.parse(release.mod_version).major > modVersion.major) continue;

    const buffer = await releases.getScripts(result, release.id);
    return new Response(buffer, { headers: { "Content-Type": "application/zip" } });
  }

  return new Response("Unknown release", { status: 404 });
});
