import mysql from "mysql2";
import { ParsedUrlQuery } from "querystring";
import { Brackets, FindOptionsUtils } from "typeorm";
import { PublicModule, Sort } from "utils/db";

import { BadQueryParamError, ClientError } from "../api";
import { db, Module } from "../db";

export const getOnePublic = async (nameOrId: string): Promise<PublicModule> => {
  return (await getOne(nameOrId)).public();
};

export const getOne = async (nameOrId: string): Promise<Module> => {
  const builder = db
    .getRepository(Module)
    .createQueryBuilder("module")
    .leftJoinAndSelect("module.user", "user");

  FindOptionsUtils.joinEagerRelations(
    builder,
    builder.alias,
    builder.expressionMap.mainAlias!.metadata,
  );

  const id = parseInt(nameOrId);

  if (isNaN(id)) {
    builder.where("upper(module.name) = :name", { name: nameOrId.toUpperCase() });
  } else {
    builder.where("module.id = :id", { id: nameOrId });
  }

  const result = await builder.getOne();
  if (!result) throw new ClientError(`Unknown module name or id "${nameOrId}"`);

  return result;
};

export interface ManyResponse {
  modules: Module[];
  meta: {
    total: number;
    offset: number;
    limit: number;
    sort: Sort;
  };
}

export interface ManyResponsePublic {
  modules: PublicModule[];
  meta: ManyResponse["meta"];
}

export const getManyPublic = async (params: ParsedUrlQuery): Promise<ManyResponsePublic> => {
  const { modules, meta } = await getMany(params);

  return {
    modules: await Promise.all(modules.map(m => m.public())),
    meta,
  };
};

export const getMany = async (params: ParsedUrlQuery): Promise<ManyResponse> => {
  const owner = params["owner"];
  const tags = params["tag"];
  const flagged = getBooleanQuery(params, "flagged") ?? false;
  const name = params["name"];
  let q = params["q"];
  let sort = params["sort"] ?? "DATE_CREATED_DESC";
  const limit = getIntQuery(params, "limit") ?? 25;
  const offset = getIntQuery(params, "offset") ?? 0;

  if (
    Array.isArray(sort) ||
    (sort !== "DATE_CREATED_DESC" &&
      sort !== "DATE_CREATED_ASC" &&
      sort !== "DOWNLOADS_DESC" &&
      sort !== "DOWNLOADS_ASC")
  )
    throw new BadQueryParamError("sort", sort);

  const builder = db
    .getRepository(Module)
    .createQueryBuilder("module")
    .leftJoinAndSelect("module.user", "user");

  FindOptionsUtils.joinEagerRelations(
    builder,
    builder.alias,
    builder.expressionMap.mainAlias!.metadata,
  );

  if (owner) {
    const values = Array.isArray(owner) ? owner : owner.split(",");
    builder.andWhere(
      new Brackets(qb => {
        for (const value of values) {
          const id = parseInt(value);
          if (isNaN(id)) {
            qb.orWhere("upper(user.name) like " + mysql.escape(`%${value.toUpperCase()}%`));
          } else {
            qb.orWhere("user.id like :userId", { userId: id });
          }
        }
      }),
    );
  }

  if (tags?.length) {
    const values = Array.isArray(tags) ? tags : tags.split(",");
    for (const value of values) {
      builder.andWhere("upper(module.tags) like " + mysql.escape(`%${value.toUpperCase()}%`));
    }
  }

  // TODO: Allow this conditionally if authed
  if (!flagged) builder.andWhere("module.flagged = 0");

  if (name) {
    const values = Array.isArray(name) ? name : name.split(",");
    builder.andWhere(
      new Brackets(qb => {
        for (const value of values) {
          qb.orWhere("upper(module.name) like " + mysql.escape(`%${value.toUpperCase()}%`));
        }
      }),
    );
  }

  if (q) {
    if (Array.isArray(q)) throw new BadQueryParamError("q", q);

    q = mysql.escape(`%${q.toUpperCase()}%`);
    builder.andWhere(
      new Brackets(qb => {
        qb.where("upper(module.description) like " + q)
          .orWhere("upper(module.name) like " + q)
          .orWhere("upper(user.name) like " + q);
      }),
    );
  }

  switch (sort) {
    case "DOWNLOADS_ASC":
      builder.orderBy("module.downloads", "ASC");
      break;
    case "DOWNLOADS_DESC":
      builder.orderBy("module.downloads", "DESC");
      break;
    case "DATE_CREATED_ASC":
      builder.orderBy("module.created_at", "ASC");
      break;
    default:
      sort = Sort.DATE_CREATED_DESC;
      builder.orderBy("module.created_at", "DESC");
      break;
  }

  builder.skip(offset).take(limit);

  const [modules, total] = await builder.getManyAndCount();
  return { modules, meta: { total, offset, limit, sort: sort as Sort } };
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
