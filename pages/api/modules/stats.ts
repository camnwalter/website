import { NextApiRequest, NextApiResponse } from "next";
import * as api from "utils/api";
import { db } from "utils/db";

export default api.wrap(async (req: NextApiRequest, res: NextApiResponse) => {
  const stats = await db.execute(`
  select 
    (select count(*) from Modules) as module_count,
    (select count(*) from Releases) as release_count,
    (select count(*) from Users) as user_count,
    sum(downloads) as total_downloads from Releases;
  `);

  res.status(200).json((stats[0] as unknown[])[0]);
});
