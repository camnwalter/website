import * as fs from "fs/promises";
import { ClientError } from "utils/api";
import { Module } from "utils/types";

import * as modules from "./modules";

export async function getScriptsForModule(
  moduleOrIdentifier: Module | string,
  releaseId: string,
): Promise<Buffer | undefined> {
  if (typeof moduleOrIdentifier !== "object") {
    const result = await modules.getOne(moduleOrIdentifier);
    if (!result) throw new ClientError(`Unknown module`);
    return getScriptsForModule(result, releaseId);
  }

  for (const release of moduleOrIdentifier.releases) {
    if (release.id === releaseId)
      return await fs.readFile(
        `storage/${moduleOrIdentifier.name.toLowerCase()}/${release.id}/scripts.zip`,
      );
  }

  return;
}
