import { ClientError, getSessionFromRequest, route } from "app/api";
import { db, Module, Rank } from "app/api/db";
import * as modules from "app/api/modules";
import type { NextRequest } from "next/server";
import type { SlugProps } from "utils/next";

export const GET = route(async (req: NextRequest, { params }: SlugProps<"nameOrId">) => {
  const result = await modules.getOnePublic(params.nameOrId);
  if (result) return Response.json(result);
  return new Response(null, { status: 404 });
});

export const PATCH = route(async (req: NextRequest, { params }: SlugProps<"nameOrId">) => {
  const data = await req.formData();

  const existingModule = await modules.getOne(params.nameOrId);
  if (!existingModule) return new Response("Unknown module", { status: 404 });

  const user = getSessionFromRequest(req);
  if (!user) return new Response("Must be signed in", { status: 403 });

  if (existingModule.user.id !== user.id && user.rank === Rank.DEFAULT)
    return new Response("No permission to edit module", { status: 403 });

  const summary = data.get("summary");
  if (summary && typeof summary !== "string")
    throw new ClientError("Module summary must be a string");
  existingModule.summary = summary;

  const description = data.get("description");
  if (description && typeof description !== "string")
    throw new ClientError("Module description must be a string");
  existingModule.description = description;

  const image = data.get("image");
  if (image) {
    if (typeof image === "string") throw new ClientError("Module image must be a file");
    await modules.saveImage(existingModule, image);
  }

  const flagged = data.get("flagged");
  if (flagged) {
    if (flagged && typeof flagged !== "string")
      throw new ClientError("Module flagged must be a string");
    if (user.rank !== Rank.DEFAULT) {
      existingModule.flagged = flagged === "true";
    } else {
      throw new Response('No permission to pass the "flagged" parameter', { status: 403 });
    }
  }

  existingModule.tags = modules.getTagsFromForm(data);

  await db.getRepository(Module).save(existingModule);

  return new Response("Module update", { status: 200 });
});

export const DELETE = route(async (req: NextRequest, { params }: SlugProps<"nameOrId">) => {
  const existingModule = await modules.getOne(params.nameOrId);
  if (!existingModule) return new Response("Unknown module", { status: 404 });

  const user = getSessionFromRequest(req);
  if (!user) return new Response("No permission to delete module", { status: 403 });

  if (existingModule.user.id !== user.id && user.rank === Rank.DEFAULT)
    return new Response("No permission to delete module", { status: 403 });

  await db.getRepository(Module).remove(existingModule);

  return new Response("Module deleted", { status: 200 });
});
