import type { NextApiRequest, NextApiResponse } from "next";
import * as api from "utils/api";

export default api.wrap(async (req: NextApiRequest, res: NextApiResponse) => {
  const result = await api.modules.getOnePublic(req.query.nameOrId as string);
  if (result) return res.status(200).json(result);
  res.status(404);
});
