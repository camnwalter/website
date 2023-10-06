import type { NextApiRequest, NextApiResponse } from "next";
import * as api from "utils/api";

const getModules = api.wrap(async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json(await api.modules.getMany(req.query));
});

// const postModules = api.wrap((req: NextApiRequest, res: NextApiResponse) => {

// });

export default api.wrap((req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") return getModules(req, res);
  // if (req.method === "POST") return postModules(req, res);

  res.status(405);
});
