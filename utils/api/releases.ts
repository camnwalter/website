import * as fs from "fs/promises";
import { ClientError } from "utils/api";
import { Module } from "utils/types";

import * as modules from "./modules";

export async function getScriptsForModule(
  moduleOrIdentifier: Module | string,
  releaseId: string,
): Promise<Buffer | undefined> {
  if (typeof moduleOrIdentifier !== "object") {
    const module = await modules.getOne(moduleOrIdentifier);
    if (!module) throw new ClientError(`Unknown module`);
    return getScriptsForModule(module, releaseId);
  }

  for (const release of moduleOrIdentifier.releases) {
    console.log(`l: ${release.id}, r: ${releaseId}`);
    if (release.id === releaseId)
      return await fs.readFile(
        `storage/${moduleOrIdentifier.name.toLowerCase()}/${release.id}/scripts.zip`,
      );
  }

  return;
}
