import type { NextApiRequest, NextApiResponse } from "next";
import { queryBuilder, wrap } from "utils/api";
import { getModuleFromId, knex } from "utils/db";
import type { DBModule } from "utils/types";

const limitQuery = queryBuilder("limit", "number?");
const offsetQuery = queryBuilder("offset", "number?");
const ownerQuery = queryBuilder("owner", "number?");
const trustedQuery = queryBuilder("trusted", "boolean?");
const tagsQuery = queryBuilder("tag", "string?");
const flaggedQuery = queryBuilder("flagged", "boolean?");
const qQuery = queryBuilder("q", "string?");
const sortQuery = queryBuilder("sort", "string?");

const getModules = wrap(async (req: NextApiRequest, res: NextApiResponse) => {
  const limit = limitQuery(req) ?? 10;
  const offset = offsetQuery(req) ?? 0;
  const owner = ownerQuery(req);
  const trusted = trustedQuery(req);
  const tags = tagsQuery(req);
  const flagged = flaggedQuery(req);
  const q = qQuery(req);
  const sort = sortQuery(req);

  const builder = knex<DBModule>("Modules")
    .limit(limit)
    .offset(offset)
    .join("Users", "Users.id", "Modules.user_id");

  if (owner) builder.where("Users.id", "=", "Modules.user_id");

  if (trusted) {
    // TODO
  }

  if (tags) tags.split(",").forEach(tag => builder.where("tags", "like", `%${tag}%`));

  if (flagged) {
    // TODO
  }

  if (q) {
    const comp = `%${q}%`;
    builder.where(b => {
      b.where("Users.name", "like", comp)
        .orWhere("Modules.name", "like", comp)
        .orWhere("description", "like", comp)
        .orWhere("tags", "like", comp);
    });
  }

  switch (sort) {
    case "DOWNLOADS_ASC":
      builder.orderBy("Modules.downloads", "asc");
      break;
    case "DOWNLOADS_DESC":
      builder.orderBy("Modules.downloads", "desc");
      break;
    case "DATE_CREATED_ASC":
      builder.orderBy("Modules.created_at", "asc");
      break;
    case "DATE_CREATE_DESC":
    default:
      builder.orderBy("Modules.created_at", "desc");
      break;
  }

  const dbModules = await builder.select<DBModule[]>();
  const modules = await Promise.all(dbModules.map(module => getModuleFromId(module.id)));
  res.status(200).json(modules);
});

const postModules = wrap((req: NextApiRequest, res: NextApiResponse) => {});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return getModules(req, res);
  if (req.method === "POST") return postModules(req, res);

  res.status(405);
}
