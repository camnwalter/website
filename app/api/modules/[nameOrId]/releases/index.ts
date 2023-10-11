import { ClientError } from "app/api";
import { db, Module, Release } from "app/api/db";
import * as modules from "app/api/modules";
import * as fs from "fs/promises";

export async function getScripts(
  moduleOrIdentifier: Module | string,
  releaseId: string,
): Promise<Buffer | undefined> {
  if (typeof moduleOrIdentifier !== "object") {
    const result = await modules.getOne(moduleOrIdentifier);
    if (!result) throw new ClientError(`Unknown module`);
    return getScripts(result, releaseId);
  }

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
