import { BadQueryParamError, ClientError } from "app/api";
import type { PublicModule } from "app/api/db";
import { db, Module, Sort } from "app/api/db";
import mysql from "mysql2";
import sharp from "sharp";
import { Brackets, FindOptionsUtils } from "typeorm";
import type { URLSearchParams } from "url";
import { validate as uuidValidate } from "uuid";

const MAX_IMAGE_SIZE = 1000;

export const getOnePublic = async (nameOrId: string): Promise<PublicModule | undefined> => {
  return (await getOne(nameOrId))?.public();
};

export const getOne = async (nameOrId: string): Promise<Module | undefined> => {
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

  return (await builder.getOne()) ?? undefined;
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
  const name = params.get("name");
  const summary = params.get("summary");
  const description = params.get("description");
  const owner = params.get("owner");
  const tags = params.get("tag");
  let q = params.get("q");
  let limit = getIntQuery(params, "limit") ?? 25;
  let offset = getIntQuery(params, "offset") ?? 0;
  let sort = params.get("sort") ?? "DATE_CREATED_DESC";
  const flagged = getBooleanQuery(params, "flagged") ?? false;
  const trusted = getBooleanQuery(params, "trusted") ?? false;

  if (limit < 1) limit = 1;
  if (limit > 100) limit = 100;
  if (offset < 0) offset = 0;

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

  // TODO: Allow array query style
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
    // const rank = session?.user.rank;
    // if (rank !== Rank.TRUSTED && rank !== Rank.ADMIN)
    //   throw new ClientError('Invalid permission for "flagged" parameter');
  } else {
    builder.andWhere("module.flagged = 0");
  }

  if (trusted) {
    // TODO:
  }

  if (name) {
    builder.orWhere("upper(module.name) like " + mysql.escape(`%${name.toUpperCase()}%`));
  }

  if (summary) {
    builder.orWhere("upper(module.summary) like " + mysql.escape(`%${summary.toUpperCase()}%`));
  }

  if (description) {
    builder.orWhere(
      "upper(module.description) like " + mysql.escape(`%${description.toUpperCase()}%`),
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

export const getTagsFromForm = (data: FormData): string[] => {
  return data
    .getAll("tag")
    .flatMap(tag => {
      if (typeof tag !== "string") throw new ClientError("Tag must be a string");
      return tag.split(",");
    })
    .map(tag => tag.trim())
    .filter(tag => tag.length);
};

export const saveImage = async (module: Module, file: string | Blob) => {
  if (typeof file === "string") throw new ClientError("Module image must be a file");

  const image = await sharp(await file.arrayBuffer());
  let { width, height } = await image.metadata();
  if (!width || !height) throw new Error(`Unable to get metadata for image`);

  if (width > MAX_IMAGE_SIZE) {
    height /= width / MAX_IMAGE_SIZE;
    width = MAX_IMAGE_SIZE;
  }

  if (height > MAX_IMAGE_SIZE) {
    width /= height / MAX_IMAGE_SIZE;
    height = MAX_IMAGE_SIZE;
  }

  image.resize(Math.floor(width), Math.floor(height), { fit: "contain" });
  await image.png().toFile(`public/assets/modules/${module.name}.png`);
  module.image = `/assets/modules/${module.name}.png`;
};
