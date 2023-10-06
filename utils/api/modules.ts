import mysql from "mysql2";
import { ParsedUrlQuery } from "querystring";
import { exec } from "utils/db";
import { DBModule, DBRelease, DBUser, Module, Sort, User } from "utils/types";
import { stringify } from "uuid";

import { BadQueryParamError, ClientError } from "../api";

export const getOne = async (nameOrId: string): Promise<Module> => {
  const id = parseInt(nameOrId);
  const res = isNaN(id)
    ? exec<DBModule>("select * from Modules where name = ?;", nameOrId)
    : exec<DBModule>("select * from Modules where id = ?;", id);
  const dbModule = (await res)[0];
  if (!dbModule) throw new ClientError(`Unknown module name or ID ${nameOrId}`);
  return getModuleFromDb(dbModule);
};

interface ManyResponse {
  modules: Module[];
  total: number;
  offset: number;
  limit: number;
  sort: Sort;
}

export const getMany = async (params: ParsedUrlQuery): Promise<ManyResponse> => {
  const limit = getIntQuery(params, "limit") ?? 25;
  const offset = getIntQuery(params, "offset") ?? 0;
  const owner = params["owner"];
  let tags = params["tag"];
  const flagged = getBooleanQuery(params, "flagged") ?? false;
  let q = params["q"];
  const sort = params["sort"] ?? "DATE_CREATED_DESC";

  if (
    Array.isArray(sort) ||
    (sort !== "DATE_CREATED_DESC" &&
      sort !== "DATE_CREATED_ASC" &&
      sort !== "DOWNLOADS_DESC" &&
      sort !== "DOWNLOADS_ASC")
  )
    throw new BadQueryParamError("sort", sort);

  let sql = " from Modules left join Users on Users.id = Modules.user_id";
  const sqlParams: unknown[] = [];

  if (owner) {
    if (Array.isArray(owner)) throw new BadQueryParamError("owner", owner);
    const id = parseInt(owner);
    if (isNaN(id)) {
      sql += " where Users.name = ?";
      sqlParams.push(owner);
    } else {
      sql += " where Users.id = ?";
      sqlParams.push(id);
    }
  }

  if (tags?.length) {
    if (!Array.isArray(tags)) tags = tags.split(",");

    for (const tag of tags) {
      sql += " where tags like " + mysql.escape(`%${tag}%`);
    }
  }

  if (flagged) {
    // TODO
  }

  if (q) {
    if (Array.isArray(q)) throw new BadQueryParamError("q", q);

    q = mysql.escape(`%${q.toUpperCase()}%`);
    sql += ` where (upper(Users.name) like ${q}) or (upper(Modules.name) like ${q}) or (upper(Modules.description) like ${q})`;
  }

  switch (sort) {
    case "DOWNLOADS_ASC":
      sql += " order by Modules.downloads asc";
      break;
    case "DOWNLOADS_DESC":
      sql += " order by Modules.downloads desc";
      break;
    case "DATE_CREATED_ASC":
      sql += " order by Modules.created_at asc";
      break;
    default:
      sql += " order by Modules.created_at desc";
      break;
  }

  // If we want to know the total number of rows that would have been returned without the limit,
  // we need to execute the query twice: once with LIMIT, and once without. This is faster than
  // the SQL_CALC_FOUND_ROWS + FOUND_ROWS() method (and that is deprecated anyways).
  const total = (await exec<{ total: number }>("select count(*) as total" + sql, ...sqlParams))[0]
    .total;

  sql += " limit ?, ?;";
  sqlParams.push(offset);
  sqlParams.push(limit);
  const dbModules = await exec<DBModule>("select Modules.*" + sql, ...sqlParams);
  return { modules: await Promise.all(dbModules.map(getModuleFromDb)), total, offset, limit, sort };
};

export const getUser = async (id: number): Promise<User> => {
  const dbUser = (await exec<DBUser>(`select * from Users where id = ?`, id))[0];
  if (!dbUser) throw new ClientError(`Unknown user id ${id}`);
  return { id: dbUser.id, name: dbUser.name, rank: dbUser.rank };
};

const getModuleFromDb = async (dbModule: DBModule): Promise<Module> => {
  const user = await getUser(dbModule.user_id);

  const releases = (
    await exec<DBRelease>(
      "select * from Releases where module_id = ? order by created_at desc",
      dbModule.id,
    )
  ).map(r => ({
    id: stringify(r.id),
    releaseVersion: r.release_version,
    modVersion: r.mod_version,
    changelog: r.changelog,
    downloads: r.downloads,
    verified: r.verified,
  }));

  return {
    id: dbModule.id,
    owner: user,
    name: dbModule.name,
    summary: dbModule.summary,
    description: dbModule.description,
    image: dbModule.image,
    downloads: dbModule.downloads,
    createdAt: dbModule.created_at.getTime(),
    updatedAt: dbModule.updated_at.getTime(),
    tags: dbModule.tags.length ? dbModule.tags.split(",") : [],
    releases,
    flagged: dbModule.hidden,
  };
};

const getIntQuery = (params: ParsedUrlQuery, name: string): number | undefined => {
  const value = params[name];
  if (!value) return undefined;
  if (Array.isArray(value)) throw new BadQueryParamError(name, value);

  const id = parseInt(value);
  if (isNaN(id)) throw new BadQueryParamError(name, value);
  return id;
};

const getBooleanQuery = (params: ParsedUrlQuery, name: string): boolean | undefined => {
  const value = params[name];
  if (!value) return undefined;
  if (Array.isArray(value)) throw new BadQueryParamError(name, value);

  if (value === "1" || value === "true") return true;
  if (value === "0" || value === "false") return false;

  // TODO: Add an "expected" parameter here
  throw new BadQueryParamError(name, value);
};
