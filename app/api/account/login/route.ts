import {
  BadQueryParamError,
  getSessionFromRequest,
  MissingQueryParamError,
  route,
  setSession,
} from "app/api";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { verify } from "..";

export const POST = route(async (req: NextRequest) => {
  if (getSessionFromRequest(req)) return new Response("Already logged in", { status: 400 });

  const body = await req.json();

  const username = body["username"];
  const password = body["password"];

  if (!username) throw new MissingQueryParamError("username");
  if (!password) throw new MissingQueryParamError("password");

  if (typeof username !== "string") throw new BadQueryParamError("username", username);
  if (typeof password !== "string") throw new BadQueryParamError("password", password);

  const user = await verify(username, password);
  if (!user) return new Response("Authentication failed", { status: 401 });

  const publicUser = user.publicAuthenticated();
  const response = NextResponse.json(publicUser);
  setSession(response, publicUser);

  return response;
});
