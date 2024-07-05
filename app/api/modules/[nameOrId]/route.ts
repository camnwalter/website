import type { SlugProps } from "app/(utils)/next";
import {
  ClientError,
  ForbiddenError,
  NotAuthenticatedError,
  NotFoundError,
  getFormData,
  getFormEntry,
  getSessionFromRequest,
  route,
} from "app/api";
import { Module, Rank, db } from "app/api";
import * as modules from "app/api/modules";
import type { NextRequest } from "next/server";

export const GET = route(async (req: NextRequest, { params }: SlugProps<"nameOrId">) => {
  const session = getSessionFromRequest(req);
  const result = await modules.getOnePublic(params.nameOrId, session);
  if (result) return Response.json(result);
  throw new NotFoundError("Module not found");
});

export const PATCH = route(async (req: NextRequest, { params }: SlugProps<"nameOrId">) => {
  const module = await modules.getOne(params.nameOrId);
  if (!module) throw new NotFoundError("Module not found");

  const sessionUser = getSessionFromRequest(req);
  if (!sessionUser) throw new NotAuthenticatedError();

  if (module.user.id !== sessionUser.id && sessionUser.rank === Rank.default)
    throw new ForbiddenError("No permission to edit module");

  const form = await getFormData(req);
  const summary = getFormEntry({
    form,
    name: "summary",
    type: "string",
    optional: true,
  });
  if (summary && summary.length > 300)
    throw new ClientError("Module summary cannot be more than 300 characters");

  const description = getFormEntry({
    form,
    name: "description",
    type: "string",
    optional: true,
  });

  const image = getFormEntry({
    form,
    name: "image",
    type: "file",
    optional: true,
  });
  const imagePath = image ? await modules.saveImage(module, image) : module.image;

  const hiddenStr = getFormEntry({
    form,
    name: "hidden",
    type: "string",
    optional: true,
  });
  if (
    hiddenStr &&
    hiddenStr !== "0" &&
    hiddenStr !== "1" &&
    hiddenStr !== "true" &&
    hiddenStr !== "false"
  )
    throw new ClientError("Module hidden must be a boolean string");
  const hidden = hiddenStr === "1" || hiddenStr === "true";
  const tags = modules.getTagsFromForm(form).join(",");

  db.module.update({
    where: { id: module.id },
    data: {
      summary,
      description,
      image: imagePath,
      hidden,
      tags,
    },
  });
  return new Response("Module updated");
});

export const DELETE = route(async (req: NextRequest, { params }: SlugProps<"nameOrId">) => {
  const module = await modules.getOne(params.nameOrId);
  if (!module) throw new NotFoundError("Module not found");

  const session = getSessionFromRequest(req);
  if (!session) throw new NotAuthenticatedError();

  if (module.user.id !== session.id && session.rank === Rank.default)
    throw new ForbiddenError("No permission to edit module");

  db.module.delete({ where: { id: module.id } });

  return new Response("Module deleted");
});
