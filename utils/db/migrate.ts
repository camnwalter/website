/* eslint-disable @next/next/no-assign-module-variable */

// Migrates all data from the old database to the new database. To run,
// insert the following at the end of utils/db/index.ts:
//
// import { migrate } from "./migrate";
// await migrate();
// process.exit(0);
//
// Also need to add "synchronize: true" to the DataSource creation options.

import * as fs from "fs/promises";
import mysql from "mysql2/promise";
import * as path from "path";
import sharp from "sharp";
import { stringify } from "uuid";

import { db, Module, Release, User } from "./index";

const MAX_IMAGE_SIZE = 1000;

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

  console.log("Mapping users...");
  const users: User[] = (oldUsers as any[])
    .map(oldUser => {
      const user = new User();
      user.id = oldUser.id;
      user.name = oldUser.name;
      user.email = oldUser.email;
      user.password = oldUser.password;
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
      module.id = oldModule.id;
      module.name = oldModule.name;
      module.description = oldModule.description;
      module.downloads = oldModule.downloads;
      module.user = users.find(u => u.id === oldModule.user_id);
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
        const imagePath = `public/assets/modules/${module.name}.png`;
        try {
          await fs.stat(imagePath);
          module.has_image = true;
          return module;
        } catch {}

        const controller = new AbortController();
        setTimeout(controller.abort, 60000);
        const response = await fetch(oldModule.image, { signal: controller.signal });
        const buffer = await response.arrayBuffer();

        const image = await sharp(buffer);
        let { width, height } = await image.metadata();
        if (!width || !height)
          throw new Error(`Unable to get metadata for image from module ${module.name}`);

        if (width > MAX_IMAGE_SIZE) {
          height /= width / MAX_IMAGE_SIZE;
          width = MAX_IMAGE_SIZE;
        }

        if (height > MAX_IMAGE_SIZE) {
          width /= height / MAX_IMAGE_SIZE;
          height = MAX_IMAGE_SIZE;
        }

        image.resize(Math.floor(width), Math.floor(height));

        try {
          await fs.stat(imagePath);
        } catch {
          console.log(`Writing image for module ${module.name} (${imagePath})`);
          await image.png().toFile(imagePath);
          module.has_image = true;
        }
      } else {
        module.has_image = false;
      }

      return module;
    }),
  );

  console.log("Mapping releases...");
  const releases: Release[] = oldReleases.map(oldRelease => {
    const release = new Release();
    release.id = stringify(oldRelease.id);
    release.module = modules.find(m => m.id === oldRelease.module_id);
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