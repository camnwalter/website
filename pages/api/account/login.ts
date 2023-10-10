import type { NextApiRequest, NextApiResponse } from "next";
import * as api from "utils/api";

export default api.wrap(async (req: NextApiRequest, res: NextApiResponse) => {
  const username = req.query["username"];
  const password = req.query["password"];

  if (!username) throw new api.MissingQueryParamError("username");
  if (!password) throw new api.MissingQueryParamError("password");

  if (Array.isArray(username)) throw new api.BadQueryParamError("username", username);
  if (Array.isArray(password)) throw new api.BadQueryParamError("password", password);

  const user = await api.auth.verify(username, password);

  if (!user) return res.status(401).send("Authentication failed");

  res.status(200).json(user.public());
});
