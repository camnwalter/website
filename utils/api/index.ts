import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

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

export * as modules from "./modules";
export * as releases from "./releases";
