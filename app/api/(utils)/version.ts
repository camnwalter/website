import * as fs from "fs/promises";

interface AllowedVersions {
  modVersions: Record<string, string[]>;
  validGameVersions: string[];
}

let lastModVersionsFileReadTime: number | undefined;
let cachedModVersions: AllowedVersions | undefined;

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

export const getAllowedVersions = async () => {
  if (!lastModVersionsFileReadTime || Date.now() - ONE_HOUR_IN_MS > lastModVersionsFileReadTime) {
    cachedModVersions = JSON.parse((await fs.readFile("./public/versions.json")).toString("utf8"));
    lastModVersionsFileReadTime = Date.now();
  }

  return cachedModVersions!;
};

export default class Version {
  major: number;
  minor: number;
  patch: number;

  constructor(major: number, minor: number, patch: number) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
  }

  static parse(text: string): Version | undefined {
    const parts = text.split(".");
    if (parts.length !== 3) return undefined;

    const major = parseInt(parts[0]);
    const minor = parseInt(parts[1]);
    const patch = parseInt(parts[2]);
    if (isNaN(major) || isNaN(minor) || isNaN(patch)) return undefined;

    return new Version(major, minor, patch);
  }

  compare(other: Version): number {
    if (this.major != other.major) return other.major - this.major;
    if (this.minor != other.minor) return other.minor - this.minor;
    return other.patch - this.patch;
  }
}
