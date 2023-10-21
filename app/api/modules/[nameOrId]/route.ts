import {
  ClientError,
  ForbiddenError,
  getFormData,
  getFormEntry,
  getSessionFromRequest,
  NotAuthenticatedError,
  NotFoundError,
  route,
} from "app/api";
import { db, Module, Rank } from "app/api/db";
import * as modules from "app/api/modules";
import type { NextRequest } from "next/server";
import type { SlugProps } from "utils/next";

export const GET = route(async (req: NextRequest, { params }: SlugProps<"nameOrId">) => {
  const result = await modules.getOnePublic(params.nameOrId);
  if (result) return Response.json(result);
  throw new NotFoundError("Module not found");
});

export const PATCH = route(async (req: NextRequest, { params }: SlugProps<"nameOrId">) => {
  const existingModule = await modules.getOne(params.nameOrId);
  if (!existingModule) throw new NotFoundError("Module not found");

  const sessionUser = getSessionFromRequest(req);
  if (!sessionUser) throw new NotAuthenticatedError();

  if (existingModule.user.id !== sessionUser.id && sessionUser.rank === Rank.DEFAULT)
    throw new ForbiddenError("No permission to edit module");

  const form = await getFormData(req);
  const summary = getFormEntry({ form, name: "summary", type: "string", optional: true });
  if (summary && summary.length > 300)
    throw new ClientError("Module summary cannot be more than 300 characters");

  existingModule.summary = summary ?? null;

  existingModule.description =
    getFormEntry({ form, name: "description", type: "string", optional: true }) ?? null;

  const image = getFormEntry({ form, name: "image", type: "file", optional: true });
  if (image) {
    await modules.saveImage(existingModule, image);
  } else {
    existingModule.image = null;
  }

  const hidden = getFormEntry({ form, name: "hidden", type: "string", optional: true });
  if (hidden && hidden !== "0" && hidden !== "1" && hidden !== "true" && hidden !== "false")
    throw new ClientError("Module hidden must be a boolean string");
  existingModule.hidden = hidden === "1" || hidden === "true";

  existingModule.tags = modules.getTagsFromForm(form);

  await db.getRepository(Module).save(existingModule);

  return new Response("Module updated");
});

export const DELETE = route(async (req: NextRequest, { params }: SlugProps<"nameOrId">) => {
  const existingModule = await modules.getOne(params.nameOrId);
  if (!existingModule) throw new NotFoundError("Module not found");

  const sessionUser = getSessionFromRequest(req);
  if (!sessionUser) throw new NotAuthenticatedError();

  if (existingModule.user.id !== sessionUser.id && sessionUser.rank === Rank.DEFAULT)
    throw new ForbiddenError("No permission to edit module");

  await db.getRepository(Module).remove(existingModule);

  return new Response("Module deleted");
});
