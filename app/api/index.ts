import type { AuthenticatedUser } from "app/api/db/entities";
import jwt from "jsonwebtoken";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import type { RequestCookies } from "next/dist/server/web/spec-extension/cookies";
import type { NextRequest, NextResponse } from "next/server";
import type { SlugProps } from "utils/next";

export class ClientError extends Error {}

export class BadQueryParamError extends ClientError {
  constructor(name: string, badValue: string | string[]) {
    super(`Invalid value ${badValue} for query parameter ${name}`);
    this.name = "BadQueryParamError";
  }
}

export class MissingQueryParamError extends ClientError {
  constructor(name: string) {
    super(`Missing query parameter ${name}`);
    this.name = "MissinQueryParamError";
  }
}

export class ServerError extends Error {}

type ApiHandler<T extends string> = (
  req: NextRequest,
  params: SlugProps<T>,
) => Response | Promise<Response>;

export function route<T extends string>(func: ApiHandler<T>): ApiHandler<T> {
  return async (req, params) => {
    try {
      return await func(req, params);
    } catch (e) {
      if (e instanceof ClientError) return new Response(e.message, { status: 400 });

      console.log(e);

      if (e instanceof ServerError) return new Response(e.message, { status: 500 });

      if (process.env.NODE_ENV !== "production") {
        // This can leak SQL queries to the client, so don't do this in production
        if (e instanceof Error) return new Response(e.message, { status: 500 });
      }

      return new Response("Internal server error", { status: 500 });
    }
  };
}

const JWT_ISSUER = "ChatTriggers";

function createJWT(value: object): string {
  return jwt.sign(value, process.env.JWT_SECRET!, {
    audience: process.env.NEXT_PUBLIC_WEB_ROOT,
    expiresIn: "14d",
    issuer: JWT_ISSUER,
  });
}

function decodeJWT(token: string): object | undefined {
  const value = jwt.verify(token, process.env.JWT_SECRET!, {
    audience: process.env.NEXT_PUBLIC_WEB_ROOT,
    issuer: JWT_ISSUER,
  });

  if (typeof value === "string") return undefined;

  return value;
}

function getSession(
  cookies: RequestCookies | ReadonlyRequestCookies,
): AuthenticatedUser | undefined {
  const cookie = cookies.get(process.env.JWT_COOKIE_NAME!);
  if (!cookie) return;

  const token = decodeJWT(cookie.value);
  if (!token) return;

  // Basic sanity check
  if (!("id" in token) || !("rank" in token)) return;

  return token as AuthenticatedUser;
}

export function getSessionFromCookies(
  cookies: ReadonlyRequestCookies,
): AuthenticatedUser | undefined {
  return getSession(cookies);
}

export function getSessionFromRequest(req: NextRequest): AuthenticatedUser | undefined {
  return getSession(req.cookies);
}

export function setSession(res: NextResponse, user: AuthenticatedUser | null) {
  if (!user) {
    res.cookies.delete(process.env.JWT_COOKIE_NAME!);
    return;
  }

  res.cookies.set({
    name: process.env.JWT_COOKIE_NAME!,
    value: createJWT(user),
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}

export function toParams(searchParams: Record<string, string>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    params.set(key, value);
  }

  return params;
}
