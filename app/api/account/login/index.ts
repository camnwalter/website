import {
  ClientError,
  getFormData,
  getFormEntry,
  getSessionFromRequest,
  setSession,
} from "app/api/(utils)";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { verify } from "..";

export const signIn = async (req: NextRequest) => {
  const existingSession = getSessionFromRequest(req);
  if (existingSession) return Response.json(existingSession);

  const form = await getFormData(req);
  const username = getFormEntry({ form, name: "username", type: "string" });
  const password = getFormEntry({ form, name: "password", type: "string" });

  const user = await verify(username, password);
  if (!user) throw new ClientError("Invalid credentials");

  const authedUser = user.publicAuthenticated();
  const response = NextResponse.json(authedUser);
  setSession(response, authedUser);

  return response;
};
