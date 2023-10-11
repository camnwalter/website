import * as http from "http";
import { getIronSession, IronSessionOptions } from "iron-session";
import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next";
import type {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiHandler,
  NextApiRequest,
  NextApiResponse,
} from "next";

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

export function wrap(func: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      return await func(req, res);
    } catch (e) {
      if (e instanceof ClientError) {
        res.status(400).send(e.message);
      } else if (e instanceof ServerError) {
        res.status(500).send(e.message);

        ////////////////////////////////////////////////////////////////////////////////////////
        // TODO: Comment out this if clause since it can leak SQL queries in the error messages.
        //       It's very useful for debugging though
      } else if (e instanceof Error) {
        res.status(500).send(e.message);
        //////////////////////////////////////////////////////////////////////////////////////
      } else {
        res.status(500).send("Internal Server Error");
      }
    }
  };
}

const ironSessionOptions: IronSessionOptions = {
  cookieName: process.env.IRON_SESSION_COOKIE_NAME!,
  password: process.env.IRON_SESSION_PASSWORD!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export function getSession(
  req: http.IncomingMessage | Request,
  res: http.ServerResponse | Response,
) {
  return getIronSession(req, res, ironSessionOptions);
}

export function withSessionRoute(handler: NextApiHandler): NextApiHandler {
  return withIronSessionApiRoute(handler, ironSessionOptions);
}

export function withSessionSsr<P extends { [key: string]: unknown } = { [key: string]: unknown }>(
  handler: (context: GetServerSidePropsContext) => Awaited<GetServerSidePropsResult<P>>,
) {
  return withIronSessionSsr(handler, ironSessionOptions);
}

export * as auth from "./auth";
export * as modules from "./modules";
export * as releases from "./releases";
export * as users from "./users";
