import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

type QueryTypeStr = `${"string" | "number" | "boolean"}${"" | "[]"}${"" | "?"}`;

type QueryType<T extends string> = T extends `${infer C}?`
  ? QueryType<C> | undefined
  : T extends `${infer C}[]`
  ? QueryType<C>[]
  : T extends "string"
  ? string
  : T extends "number"
  ? number
  : T extends "boolean"
  ? boolean
  : never;

const queryTypeRegex = /(?<type>string|boolean|number)(?<array>\[\])?(?<optional>\?)?/;

export function queryBuilder<const T extends QueryTypeStr>(
  name: string,
  type: T,
): (req: NextApiRequest) => QueryType<T> {
  const matches = queryTypeRegex.exec(type)!.groups!;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parser: (v: string) => any;
  if (matches.type === "string") {
    parser = (v: string) => v;
  } else if (matches.type === "number") {
    parser = (v: string) => parseInt(v);
  } else {
    parser = (v: string) => (v === "true" ? true : false);
  }

  const optional = !!matches.optional;
  const array = !!matches.array;

  return (req: NextApiRequest) => {
    const value = req.query[name];
    if (!value) {
      if (optional) return undefined;
      throw new MissingQueryParamError(name);
    }

    if (array) return (Array.isArray(value) ? value : [value]).map(parser);

    if (Array.isArray(value)) throw new BadQueryParamError(name, value);

    return parser(value);
  };
}

class ClientError extends Error {}

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
