import type { SlugProps } from "app/(utils)/next";
import { ForbiddenError, getSessionFromRequest, NotFoundError, route } from "app/api";
import { deleteReleaseVerificationMessage } from "app/api/(utils)/webhooks";
import { db, Rank, Release } from "app/api/db";
import * as modules from "app/api/modules";
import type { NextRequest } from "next/server";

export const DELETE = route(
  async (req: NextRequest, { params }: SlugProps<"nameOrId" | "releaseId">) => {
    const user = getSessionFromRequest(req);
    if (!user) throw new ForbiddenError("No permission to delete this release");

    const module_ = await modules.getOne(params.nameOrId as string, user);
    if (!module_) throw new NotFoundError("Module not found");

    if (module_.user.id !== user.id && user.rank === Rank.DEFAULT)
      throw new ForbiddenError("No permission to delete this release");

    const releaseRepo = await db.getRepository(Release);
    const release = await releaseRepo.findOneBy({ id: params.releaseId });
    if (!release) throw new NotFoundError("Release not found");

    deleteReleaseVerificationMessage(release);
    releaseRepo.delete(release.id);

    return new Response("Deleted release");
  },
);
