import type { NextApiRequest, NextApiResponse } from "next";
import * as api from "utils/api";

export default api.wrap(async (req: NextApiRequest, res: NextApiResponse) => {
  const module = await api.modules.getOne(req.query.nameOrId as string);
  if (module) return res.status(200).json(module);
  res.status(404);
});
