import type { NextApiRequest, NextApiResponse } from "next";
import { getModuleFromNameOrId } from "utils/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const module = await getModuleFromNameOrId(req.query.nameOrId as string);
  if (module) return res.status(200).json(module);
  res.status(404);
}
