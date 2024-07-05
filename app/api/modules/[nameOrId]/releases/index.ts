import * as fs from "node:fs/promises";
import { ClientError } from "app/api";
import { Module, Release, getDb } from "app/api/db";
import * as modules from "app/api/modules";

export async function getScripts(
  moduleOrIdentifier: Module | string,
  releaseId: string,
): Promise<Buffer | undefined> {
  if (typeof moduleOrIdentifier !== "object") {
    const result = await modules.getOne(moduleOrIdentifier);
    if (!result) throw new ClientError("Unknown module");
    return getScripts(result, releaseId);
  }

  const db = await getDb();
  for (const release of moduleOrIdentifier.releases) {
    if (release.id === releaseId) {
      const result = await fs.readFile(
        `storage/${moduleOrIdentifier.name.toLowerCase()}/${release.id}/scripts.zip`,
      );

      // Increment download counters
      moduleOrIdentifier.downloads++;
      release.downloads++;
      await db.getRepository(Module).save(moduleOrIdentifier);
      await db.getRepository(Release).save(release);

      return result;
    }
  }
}

export async function getMetadata(
  moduleOrIdentifier: Module | string,
  releaseId: string,
): Promise<Buffer | undefined> {
  if (typeof moduleOrIdentifier !== "object") {
    const result = await modules.getOne(moduleOrIdentifier);
    if (!result) throw new ClientError("Unknown module");
    return getMetadata(result, releaseId);
  }

  for (const release of moduleOrIdentifier.releases) {
    if (release.id === releaseId) {
      const result = await fs.readFile(
        `storage/${moduleOrIdentifier.name.toLowerCase()}/${release.id}/metadata.json`,
      );

      return result;
    }
  }
}
