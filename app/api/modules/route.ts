import {
  ClientError,
  getSessionFromRequest,
  MissingQueryParamError,
  route,
  ServerError,
} from "app/api";
import { db, Module, User } from "app/api/db";
import * as modules from "app/api/modules";
import type { NextRequest } from "next/server";
import sharp from "sharp";

import { getTags } from "../tags";

const NAME_REGEX = /\w{3,64}/;
const MAX_IMAGE_SIZE = 1000;

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
  const tags = form.getAll("tags");

  if (!name) throw new MissingQueryParamError("name");
  if (typeof name !== "string") throw new ClientError("Module name must be a string");
  if (!NAME_REGEX.test(name)) {
    if (name.length < 3) throw new ClientError("Module name must be at least 3 characters long");
    if (name.length > 64)
      throw new ClientError("Module name cannot be longer than 64 characters long");
    throw new ClientError("Module name can only contain letters, numbers, and underscores");
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

  const tagList = tags
    .flatMap(tag => {
      if (typeof tag !== "string") throw new ClientError("Tag must be a string");
      return tag.split(",");
    })
    .map(tag => tag.trim())
    .filter(tag => tag.length);

  const allowedTags = await getTags();
  const disallowedTags: string[] = [];
  tagList.forEach(tag => {
    if (!allowedTags.has(tag)) disallowedTags.push(tag);
  });

  if (disallowedTags.length) {
    const formatter = new Intl.ListFormat("en", { style: "long", type: "conjunction" });
    throw new ClientError(`The tags ${formatter.format(disallowedTags)} are not allowed`);
  }

  let imagePath: string | null = null;
  if (imageFile) {
    if (typeof imageFile === "string") throw new ClientError("Module image must be a file");
    imagePath = `public/assets/modules/${name}.png`;
    try {
      await saveImage(imageFile, imagePath);
    } catch (e) {
      throw new ClientError("Invalid image");
    }
  }

  const newModule = new Module();
  newModule.user = user;
  newModule.name = name;
  newModule.summary = summary;
  newModule.description = description;
  newModule.image = imagePath;
  newModule.tags = tagList;
  newModule.releases = [];

  moduleRepo.save(newModule);

  return Response.json(newModule.public());
});

export const saveImage = async (file: File, path: string) => {
  const image = await sharp(await file.arrayBuffer());
  let { width, height } = await image.metadata();
  if (!width || !height) throw new Error(`Unable to get metadata for image`);

  if (width > MAX_IMAGE_SIZE) {
    height /= width / MAX_IMAGE_SIZE;
    width = MAX_IMAGE_SIZE;
  }

  if (height > MAX_IMAGE_SIZE) {
    width /= height / MAX_IMAGE_SIZE;
    height = MAX_IMAGE_SIZE;
  }

  image.resize(Math.floor(width), Math.floor(height));
  await image.png().toFile(path);
};
