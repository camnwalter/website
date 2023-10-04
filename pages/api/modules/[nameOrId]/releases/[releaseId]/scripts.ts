import type { NextApiRequest, NextApiResponse } from "next";
import * as api from "utils/api";

export default api.wrap(async (req: NextApiRequest, res: NextApiResponse) => {
  const buffer = await api.releases.getScriptsForModule(
    req.query.nameOrId as string,
    req.query.releaseId as string,
  );
  if (!buffer) return res.status(404).send("Unable to get scripts");
  res.status(200).setHeader("Content-Type", "application/zip").send(buffer);
});
