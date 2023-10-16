import {
  ClientError,
  getSessionFromRequest,
  MissingQueryParamError,
  route,
  setSession,
} from "app/api";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { verify } from "..";

export const POST = route(async (req: NextRequest) => {
  const existingSession = getSessionFromRequest(req);
  if (existingSession) return Response.json(existingSession);

  const body = await req.formData();

  const username = body.get("username");
  const password = body.get("password");

  if (!username) throw new MissingQueryParamError("username");
  if (!password) throw new MissingQueryParamError("password");

  if (typeof username !== "string") throw new ClientError("expected username to be a string");
  if (typeof password !== "string") throw new ClientError("expected password to be a string");

  const user = await verify(username, password);
  if (!user) return new Response("Authentication failed", { status: 401 });

  const publicUser = user.publicAuthenticated();
  const response = NextResponse.json(publicUser);
  setSession(response, publicUser);

  return response;
});
