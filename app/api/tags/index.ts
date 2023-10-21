import * as fs from "fs/promises";

let lastFileReadTime: number | undefined;
let cachedTags: Set<string> | undefined;

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

export const getTags = async () => {
  if (!lastFileReadTime || Date.now() - ONE_HOUR_IN_MS > lastFileReadTime) {
    cachedTags = new Set((await fs.readFile("./public/tags.txt")).toString("utf8").split("\n"));
    lastFileReadTime = Date.now();
  }

  return cachedTags!;
};
