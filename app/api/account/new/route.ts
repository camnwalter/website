import {
  BadQueryParamError,
  ClientError,
  getSessionFromRequest,
  MissingQueryParamError,
  route,
} from "app/api";
import * as account from "app/api/account";
import { db, User } from "app/api/db";
import { isEmailValid, isPasswordValid, isUsernameValid } from "app/constants";
import bcrypt from "bcrypt";
import type { NextRequest } from "next/server";

export const PUT = route(async (req: NextRequest) => {
  const existingSession = getSessionFromRequest(req);
  if (existingSession) return new Response("Already logged in", { status: 409 });

  const data = await req.formData();
  const name = data.get("username");
  if (!name) throw new MissingQueryParamError("username");
  if (typeof name !== "string") throw new ClientError("Username must be a string");
  if (!isUsernameValid(name)) throw new BadQueryParamError("username", name);

  const email = data.get("email");
  if (!email) throw new MissingQueryParamError("email");
  if (typeof email !== "string") throw new ClientError("Email must be a string");
  if (!isEmailValid(email)) throw new BadQueryParamError("email", email);

  // get image from form data as a file and validate accordinly
  const image = data.get("image");
  if (image && !(image instanceof File)) throw new ClientError("Image must be a file");

  const password = data.get("password");
  if (!password) throw new MissingQueryParamError("password");
  if (typeof password !== "string") throw new ClientError("Password must be a string");
  if (!isPasswordValid(password))
    throw new ClientError("Password must be at least 8 characters long");

  const userRepo = db.getRepository(User);

  if (await userRepo.findOneBy({ name }))
    return new Response("Username already taken", { status: 409 });
  if (await userRepo.findOneBy({ email }))
    return new Response("Email already taken", { status: 409 });

  const newUser = new User();
  newUser.name = name;
  newUser.email = email;
  newUser.password = bcrypt.hashSync(password, bcrypt.genSaltSync());

  if (image) await account.saveImage(newUser, image);

  await userRepo.save(newUser);
  return Response.json(newUser.publicAuthenticated(), { status: 201 });
});
