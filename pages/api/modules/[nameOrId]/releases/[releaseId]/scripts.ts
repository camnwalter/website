import type { NextApiRequest, NextApiResponse } from "next";
import { getReleaseScripts } from "utils/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const buffer = await getReleaseScripts(
    req.query.nameOrId as string,
    req.query.releaseId as string,
  );
  if (!buffer) return res.status(404);
  res.status(200).setHeader("Content-Type", "application/zip").send(buffer);
}
