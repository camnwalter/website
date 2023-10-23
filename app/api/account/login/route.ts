import {
  ClientError,
  getFormData,
  getFormEntry,
  getSessionFromRequest,
  route,
  setSession,
} from "app/api";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { verify } from "..";

export const POST = route(async (req: NextRequest) => {
  const existingSession = getSessionFromRequest(req);
  if (existingSession) return Response.json(existingSession);

  const form = await getFormData(req);
  const username = getFormEntry({ form, name: "username", type: "string" });
  const password = getFormEntry({ form, name: "password", type: "string" });

  const user = await verify(username, password);
  if (!user) throw new ClientError("Invalid credentials");

  const publicUser = user.publicAuthenticated();
  const response = NextResponse.json(publicUser);
  setSession(response, publicUser);

  return response;
});
