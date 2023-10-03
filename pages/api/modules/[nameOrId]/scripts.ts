import type { NextApiRequest, NextApiResponse } from "next";
import { getModuleFromName } from "utils/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const modVersion = req.query.modVersion as string;
  if (!modVersion) return res.status(404);
  const name = req.query.nameOrId as string;
  const module = await getModuleFromName(name);
  if (!module) return res.status(404);

  const releases = module.releases.filter(r => r.verified);
  releases.sort((r1, r2) => Version.parse(r1.releaseVersion).compare(Version.parse(r2.releaseVersion)));
  

  res.status(200).json({ method: req.method, url: req.url, query: req.query });
}

class Version {
  major: number;
  minor: number;
  patch: number;

  constructor(major: number, minor: number, patch: number) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
  }

  static parse(text: string) {
    // TODO: Handle failures here
    const parts = text.split('.');
    return new Version(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
  }

  compare(other: Version): number {
    if (this.major != other.major) return other.major - this.major;
    if (this.minor != other.minor) return other.minor - this.minor;
    return other.major - this.major;
  }
}
