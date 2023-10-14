/* eslint-disable @next/next/no-assign-module-variable */

// Migrates all data from the old database to the new database. To run,
// insert the following at the end of utils/db/index.ts:
//
// import { migrate } from "./migrate";
// await migrate();
// process.exit(0);
//
// Also need to add "synchronize: true" to the DataSource creation options.

import { saveImage } from "app/api/modules";
import mysql from "mysql2/promise";
import { stringify, v4 as uuid } from "uuid";

import { db, Module, Release, User } from "./index";

export const migrate = async () => {
  const oldDb = await mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT!),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: "new_website",
  });

  const [oldModules] = await oldDb.execute("select * from Modules;");
  const [oldReleases] = await oldDb.execute("select * from Releases;");
  const [oldUsers] = await oldDb.execute("select * from Users;");

  const moduleIdMap = new Map<number, string>();
  const userIdMap = new Map<number, string>();

  console.log("Mapping users...");
  const users: User[] = oldUsers
    .map(oldUser => {
      const user = new User();
      const newId = uuid();
      userIdMap.set(oldUser.id, newId);
      user.id = newId;
      user.name = oldUser.name;
      user.email = oldUser.email;
      user.password = oldUser.password;
      user.image = null;
      user.rank = oldUser.rank;
      user.created_at = oldUser.created_at;
      user.updated_at = oldUser.updated_at;
      return user;
    })
    .filter(user => user.name.length <= 32);

  console.log("Mapping modules...");
  const modules: Module[] = await Promise.all(
    oldModules.map(async oldModule => {
      const module = new Module();
      const newId = uuid();
      moduleIdMap.set(oldModule.id, newId);
      module.id = newId;
      module.name = oldModule.name;
      module.description = oldModule.description;
      module.downloads = oldModule.downloads;

      const userId = userIdMap.get(oldModule.user_id);
      if (!userId) throw new Error(`Unknown user id ${oldModule.user_id}`);
      module.user = users.find(u => u.id === userId);
      if (!module.user) throw new Error(`Could not find user id ${oldModule.user_id}`);

      module.flagged = oldModule.hidden;
      module.created_at = oldModule.created_at;
      module.updated_at = oldModule.updated_at;
      module.tags = oldModule.tags.length
        ? (oldModule.tags as string)
            .split(",")
            .map(tag => tag.trim())
            .filter(tag => tag.length)
        : [];

      if (oldModule.image) {
        const controller = new AbortController();
        setTimeout(controller.abort, 60000);
        const response = await fetch(oldModule.image, { signal: controller.signal });
        await saveImage(module, await response.blob());
      } else {
        module.image = null;
      }

      return module;
    }),
  );

  console.log("Mapping releases...");
  const releases: Release[] = oldReleases.map(oldRelease => {
    const release = new Release();
    release.id = stringify(oldRelease.id);

    const moduleId = moduleIdMap.get(oldRelease.module_id);
    if (!moduleId) throw new Error(`Unknown module id ${oldRelease.module_id}`);
    release.module = modules.find(m => m.id === moduleId);
    if (!release.module) throw new Error(`Could not find module ${oldRelease.module_id}`);

    release.release_version = oldRelease.release_version;
    release.mod_version = oldRelease.mod_version;
    release.game_versions = oldRelease.mod_version.startsWith("3")
      ? ["1.19.4", "1.20.1"]
      : ["1.8.9"];
    release.changelog = oldRelease.changelog;
    release.downloads = oldRelease.downloads;
    release.created_at = oldRelease.created_at;
    release.updated_at = oldRelease.updated_at;
    release.verified = oldRelease.verified;
    return release;
  });

  console.log("Writing users...");
  await db.getRepository(User).save(users);

  console.log("Writing modules...");
  await db.getRepository(Module).save(modules);

  console.log("Writing releases...");
  await db.getRepository(Release).save(releases);
};
