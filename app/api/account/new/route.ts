import {
  BadQueryParamError,
  ClientError,
  ConflictError,
  getFormData,
  getFormEntry,
  getSessionFromRequest,
  route,
  sendVerificationEmail,
  setSession,
} from "app/api";
import * as account from "app/api/account";
import { db, User } from "app/api/db";
import { isEmailValid, isPasswordValid, isUsernameValid } from "app/constants";
import bcrypt from "bcrypt";
import { type NextRequest, NextResponse } from "next/server";
import { Raw } from "typeorm";

export const PUT = route(async (req: NextRequest) => {
  const existingSession = getSessionFromRequest(req);
  if (existingSession) throw new ConflictError("Already authenticated");

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
  const userByName = await userRepo.findOneBy({
    name: Raw(alias => `LOWER(${alias}) like LOWER(:value)`, { value: `%${name}%` }),
  });
  if (userByName) throw new ConflictError("Username already taken");

  const userByEmail = await userRepo.findOneBy({
    email: Raw(alias => `LOWER(${alias}) like LOWER(:value)`, { value: `%${email}%` }),
  });
  if (userByEmail) throw new ConflictError("Email already taken");

  const newUser = new User();
  newUser.name = name;
  newUser.email = email;
  newUser.password = bcrypt.hashSync(password, bcrypt.genSaltSync());

  if (image) await account.saveImage(newUser, image);

  await userRepo.save(newUser);

  // Log the user in and send the verification email
  const authedUser = newUser.publicAuthenticated();
  const response = NextResponse.json(authedUser, { status: 201 });
  setSession(response, authedUser);
  await sendVerificationEmail(newUser);

  return response;
});
