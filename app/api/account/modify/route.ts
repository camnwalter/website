import {
  ClientError,
  ConflictError,
  NotAuthenticatedError,
  ServerError,
  getFormData,
  getFormEntry,
  getSessionFromRequest,
  route,
  setSession,
} from "app/api/(utils)";
import { User, getDb } from "app/api/db";
import { type NextRequest, NextResponse } from "next/server";
import { Raw } from "typeorm";

import { saveImage } from "..";

const SECONDS_PER_MONTH = 60 * 60 * 24 * 30;

export const POST = route(async (req: NextRequest) => {
  const session = getSessionFromRequest(req);
  if (!session) throw new NotAuthenticatedError();

  const form = await getFormData(req);
  const username = getFormEntry({
    form,
    name: "username",
    type: "string",
    optional: true,
  });
  const image = getFormEntry({
    form,
    name: "image",
    type: "file",
    optional: true,
  });
  if (!username && !image) return new Response();

  const db = await getDb();
  const userRepo = db.getRepository(User);
  const user = await userRepo.findOneBy({ id: session.id });
  if (!user) throw new ServerError("No user corresponding to existing session");

  if (username) {
    if (user.lastNameChangeTime) {
      const diff = new Date().getTime() - user.lastNameChangeTime.getTime();
      if (diff < SECONDS_PER_MONTH)
        throw new ClientError("Cannot change username more than once every 30 days");
    }

    const existingUser = await userRepo.findOneBy({
      name: Raw(alias => `LOWER(${alias}) like LOWER(:value)`, {
        value: `${username}`,
      }),
    });
    if (existingUser) throw new ConflictError("Username already taken");

    user.name = username;
    user.lastNameChangeTime = new Date();
  }
  if (image) await saveImage(user, image);

  await userRepo.save(user);

  if (username) {
    // Update the session if the username changes
    const authedUser = user.publicAuthenticated();
    const response = NextResponse.json(authedUser);
    setSession(response, authedUser);
    return response;
  }

  return new Response();
});
