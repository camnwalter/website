import type { NextApiRequest, NextApiResponse } from "next";
import * as api from "utils/api";

export default api.wrap(async (req: NextApiRequest, res: NextApiResponse) => {
  const modVersionStr = req.query.modVersion as string;
  if (!modVersionStr) return res.status(404).send("Missing modVersion query parameter");

  const modVersion = Version.parse(modVersionStr);

  const name = req.query.nameOrId as string;
  const result = await api.modules.getOne(name);
  if (!result) return res.status(404).send("Unknown module");

  result.releases.sort((r1, r2) => {
    const releaseComparison = Version.compareTwo(r1.release_version, r2.release_version);
    if (releaseComparison !== 0) return releaseComparison;
    return Version.compareTwo(r1.mod_version, r2.mod_version);
  });

  for (const release of result.releases) {
    if (Version.parse(release.mod_version).major > modVersion.major) continue;

    const buffer = await api.releases.getScriptsForModule(result, release.id);
    res.status(200).setHeader("Content-Type", "application/zip").send(buffer);
    return;
  }

  res.status(404).send("Unknown release");
});

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
    const parts = text.split(".");
    return new Version(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
  }

  compare(other: Version): number {
    if (this.major != other.major) return other.major - this.major;
    if (this.minor != other.minor) return other.minor - this.minor;
    return other.major - this.major;
  }

  static compareTwo(a: string, b: string) {
    return Version.parse(a).compare(Version.parse(b));
  }
}
