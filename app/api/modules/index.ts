import { BadQueryParamError, ClientError } from "app/api";
import type { PublicModule } from "app/api/db";
import { db, Module, Sort } from "app/api/db";
import mysql from "mysql2";
import { Brackets, FindOptionsUtils } from "typeorm";
import type { URLSearchParams } from "url";
import { validate as uuidValidate } from "uuid";

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

  if (uuidValidate(nameOrId)) {
    builder.where("module.id = :id", { id: nameOrId });
  } else {
    builder.where("upper(module.name) = :name", { name: nameOrId.toUpperCase() });
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

export const getManyPublic = async (params: URLSearchParams): Promise<ManyResponsePublic> => {
  const { modules, meta } = await getMany(params);

  return {
    modules: await Promise.all(modules.map(m => m.public())),
    meta,
  };
};

export const getMany = async (params: URLSearchParams): Promise<ManyResponse> => {
  const owner = params.get("owner");
  const tags = params.get("tag");
  const flagged = getBooleanQuery(params, "flagged") ?? false;
  const name = params.get("name");
  let q = params.get("q");
  let sort = params.get("sort") ?? "DATE_CREATED_DESC";
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
          if (uuidValidate(value)) {
            qb.orWhere("user.id = :userId", { userId: value });
          } else {
            qb.orWhere("upper(user.name) like " + mysql.escape(`%${value.toUpperCase()}%`));
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

  // Handler takes care of auth here
  if (flagged) {
    // TODO: iron-session v8
    // const session = await getSession(req, res);
    // const rank = session?.user?.rank;
    // if (rank !== Rank.TRUSTED && rank !== Rank.ADMIN)
    //   throw new ClientError('Invalid permission for "flagged" parameter');
  } else {
    builder.andWhere("module.flagged = 0");
  }

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

const getIntQuery = (params: URLSearchParams, name: string): number | undefined => {
  const value = params.get(name);
  if (!value) return undefined;
  if (Array.isArray(value)) throw new BadQueryParamError(name, value);

  const id = parseInt(value);
  if (isNaN(id)) throw new BadQueryParamError(name, value);
  return id;
};

const getBooleanQuery = (params: URLSearchParams, name: string): boolean | undefined => {
  const value = params.get(name);
  if (!value) return undefined;
  if (Array.isArray(value)) throw new BadQueryParamError(name, value);

  if (value === "1" || value === "true") return true;
  if (value === "0" || value === "false") return false;

  // TODO: Add an "expected" parameter here
  throw new BadQueryParamError(name, value);
};