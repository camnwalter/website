import {
  BadQueryParamError,
  ClientError,
  ConflictError,
  getFormData,
  getFormEntry,
  getSessionFromRequest,
  route,
} from "app/api";
import * as account from "app/api/account";
import { db, User } from "app/api/db";
import { isEmailValid, isPasswordValid, isUsernameValid } from "app/constants";
import bcrypt from "bcrypt";
import type { NextRequest } from "next/server";

export const PUT = route(async (req: NextRequest) => {
  const existingSession = getSessionFromRequest(req);
  if (existingSession) throw new ConflictError("Already authenticated");

  if (req.headers.get("content-type") !== "multipart/form-data")
    throw new ClientError("Expected multipart/form-data");

  const form = await getFormData(req);
  const name = getFormEntry({ form, name: "username", type: "string" });
  const email = getFormEntry({ form, name: "email", type: "string" });
  const image = getFormEntry({ form, name: "image", type: "file", optional: true });
  const password = getFormEntry({ form, name: "password", type: "string" });

  if (!isUsernameValid(name)) throw new BadQueryParamError("username", name);
  if (!isEmailValid(email)) throw new BadQueryParamError("email", email);
  if (!isPasswordValid(password))
    throw new ClientError("Password must be at least 8 characters long");

  const userRepo = db.getRepository(User);
  if (await userRepo.findOneBy({ name })) throw new ConflictError("Username already taken");
  if (await userRepo.findOneBy({ email })) throw new ConflictError("Email already taken");

  const newUser = new User();
  newUser.name = name;
  newUser.email = email;
  newUser.password = bcrypt.hashSync(password, bcrypt.genSaltSync());

  if (image) await account.saveImage(newUser, image);

  await userRepo.save(newUser);
  return Response.json(newUser.publicAuthenticated(), { status: 201 });
});
