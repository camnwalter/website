import * as fs from "fs/promises";

let lastFileReadTime: number | undefined;
let cachedTags: string[] | undefined;

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

export const getTags = async () => {
  if (!lastFileReadTime || Date.now() - ONE_HOUR_IN_MS > lastFileReadTime) {
    cachedTags = (await fs.readFile("./tags.txt")).toString("utf8").split("\n");
    lastFileReadTime = Date.now();
  }

  return cachedTags!;
};
