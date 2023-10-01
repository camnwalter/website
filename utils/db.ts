import Knex from "knex";

import { ServerError } from "./api";
import { DBModule, DBRelease, DBUser, Module, Release, User } from "./types";

export const knex = Knex({
  client: "mysql",
  connection: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT!),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
});

export async function getModuleFromNameOrId(nameOrId: string): Promise<Module | undefined> {
  let module: Module | undefined;
  console.log(`nameOrId = ${nameOrId}`);
  try {
    module = await getModuleFromId(parseInt(nameOrId));
  } catch {
    module = await getModuleFromName(nameOrId);
  }
  return module;
}

export async function getModuleFromName(name: string): Promise<Module | undefined> {
  const dbModule = await knex<DBModule>("Modules").where("name", "=", name).first();
  if (!dbModule) return undefined;
  return getModuleFromDbModule(dbModule);
}

export async function getModuleFromId(id: number): Promise<Module | undefined> {
  const dbModule = await knex<DBModule>("Modules").where("id", "=", id).first();
  if (!dbModule) return undefined;
  return getModuleFromDbModule(dbModule);
}

export async function getModuleFromDbModule(dbModule: DBModule): Promise<Module> {
  const user = await getUserFromId(dbModule.user_id);
  if (!user) {
    throw new ServerError(
      `Module ${dbModule.name} (${dbModule.id}) has invalid user id ${dbModule.user_id}`,
    );
  }

  const releases = await knex<DBRelease>("Releases")
    .where("module_id", "=", dbModule.id)
    .orderBy("created_at", "desc")
    .select<DBRelease[]>();

  return {
    id: dbModule.id,
    owner: user,
    name: dbModule.name,
    description: dbModule.description,
    image: dbModule.image,
    downloads: dbModule.downloads,
    tags: dbModule.tags.length ? dbModule.tags.split(",") : [],
    releases: releases.map(getReleaseFromDbRelease),
    flagged: dbModule.hidden,
  };
}

export async function getUserFromId(id: number): Promise<User | undefined> {
  const dbUser = await knex<DBUser>("Users").where("id", "=", id).first();

  return dbUser ? getUserFromDbUser(dbUser) : undefined;
}

export function getUserFromDbUser(dbUser: DBUser): User {
  return {
    id: dbUser.id,
    name: dbUser.name,
    rank: dbUser.rank,
  };
}

export function getReleaseFromDbRelease(dbRelease: DBRelease): Release {
  return {
    id: new TextDecoder().decode(dbRelease.id),
    releaseVersion: dbRelease.release_version,
    modVersion: dbRelease.mod_version,
    changelog: dbRelease.changelog,
    downloads: dbRelease.downloads,
    verified: dbRelease.verified,
  };
}
