import {
  ClientError,
  getSessionFromRequest,
  MissingQueryParamError,
  route,
  ServerError,
} from "app/api";
import { db, Module, User } from "app/api/db";
import * as modules from "app/api/modules";
import { isModuleValid } from "app/constants";
import type { NextRequest } from "next/server";

import { getTags } from "../tags";

export const GET = route(async (req: NextRequest) => {
  return Response.json(await modules.getManyPublic(req.nextUrl.searchParams));
});

export const PUT = route(async (req: NextRequest) => {
  const sessionUser = getSessionFromRequest(req);
  if (!sessionUser) return new Response("Not signed in", { status: 401 });

  const moduleRepo = db.getRepository(Module);
  const userRepo = db.getRepository(User);
  const user = await userRepo.findOneBy({ id: sessionUser.id });
  if (!user) throw new ServerError("Internal error: Failed to find user for session");

  const form = await req.formData();
  const name = form.get("name");
  const summary = form.get("summary");
  const description = form.get("description");
  const imageFile = form.get("image");
  const hidden = form.get("hidden");

  if (!name) throw new MissingQueryParamError("name");
  if (typeof name !== "string") throw new ClientError("Module name must be a string");
  if (!isModuleValid(name)) {
    throw new ClientError(
      "Module name must be between 3 and 64 characters, and can only contain letters, numbers, and underscores",
    );
  }

  const existing = await moduleRepo.findOneBy({ name });
  if (existing) throw new ClientError(`A module with name ${name} already exists`);

  if (summary) {
    if (typeof summary !== "string") throw new ClientError("Module summary must be a string");
    if (summary.length > 300)
      throw new ClientError("Module summary cannot be more than 300 characters");
  }

  if (description && typeof description !== "string")
    throw new ClientError("Module description must be a string");

  if (imageFile && typeof imageFile === "string")
    throw new ClientError("Module image must be a file");

  if (hidden) {
    if (typeof hidden !== "string") throw new ClientError("Module hidden must be a boolean string");

    if (hidden !== "1" && hidden !== "true" && hidden !== "0" && hidden !== "false")
      throw new ClientError("Module hidden flag must be a boolean string");
  }

  const tags = modules.getTagsFromForm(form);
  const allowedTags = await getTags();
  const disallowedTags: string[] = [];
  tags.forEach(tag => {
    if (!allowedTags.has(tag)) disallowedTags.push(tag);
  });

  if (disallowedTags.length) {
    const formatter = new Intl.ListFormat("en", { style: "long", type: "conjunction" });
    throw new ClientError(`The tags ${formatter.format(disallowedTags)} are not allowed`);
  }

  const newModule = new Module();
  newModule.user = user;
  newModule.name = name;
  newModule.summary = summary;
  newModule.description = description;
  newModule.image = null;
  newModule.tags = tags;
  newModule.hidden = hidden === "1" || hidden === "true";
  newModule.releases = [];

  if (imageFile) {
    await modules.saveImage(newModule, imageFile);
  }

  moduleRepo.save(newModule);

  return new Response("Module created", { status: 201 });
});
