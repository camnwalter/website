import {
  ClientError,
  getFormData,
  getFormEntry,
  getSessionFromRequest,
  NotAuthenticatedError,
  route,
  ServerError,
} from "app/api";
import { getDb, Module, User } from "app/api/db";
import * as modules from "app/api/modules";
import { isModuleValid as isModuleNameValid } from "app/constants";
import type { NextRequest } from "next/server";

import { getTags } from "../tags";

export const GET = route(async (req: NextRequest) => {
  return Response.json(await modules.getManyPublic(req.nextUrl.searchParams));
});

export const PUT = route(async (req: NextRequest) => {
  const sessionUser = getSessionFromRequest(req);
  if (!sessionUser) throw new NotAuthenticatedError();

  const db = await getDb();
  const moduleRepo = db.getRepository(Module);
  const userRepo = db.getRepository(User);
  const user = await userRepo.findOneBy({ id: sessionUser.id });
  if (!user || !user.emailVerified)
    throw new ServerError("Internal error: Failed to find user for session");

  const form = await getFormData(req);
  const name = await getFormEntry({ form, name: "name", type: "string" });

  const existingModule = await moduleRepo.findOneBy({ name });
  if (existingModule) throw new ClientError(`A module with name ${name} already exists`);

  if (!isModuleNameValid(name)) {
    throw new ClientError(
      "Module name must be between 3 and 64 characters, and can only contain letters, numbers, and underscores",
    );
  }

  const summary = await getFormEntry({ form, name: "summary", type: "string", optional: true });
  if (summary && summary.length > 300)
    throw new ClientError("Module summary cannot be more than 300 characters");

  const description = await getFormEntry({
    form,
    name: "description",
    type: "string",
    optional: true,
  });

  const image = await getFormEntry({ form, name: "image", type: "file", optional: true });

  const hidden = await getFormEntry({ form, name: "hidden", type: "string", optional: true });
  if (hidden && hidden !== "1" && hidden !== "true" && hidden !== "0" && hidden !== "false")
    throw new ClientError("Module hidden flag must be a boolean string");

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
  newModule.summary = summary ?? null;
  newModule.description = description ?? null;
  newModule.image = null;
  newModule.tags = tags;
  newModule.hidden = hidden === "1" || hidden === "true";
  newModule.releases = [];

  if (image) await modules.saveImage(newModule, image);

  moduleRepo.save(newModule);

  return new Response("Module created", { status: 201 });
});
