import * as api from "utils/api";

export default api.withSessionRoute(async (req, res) => {
  if (req.method !== "POST") return res.status(404);

  if (req.session.user) return res.status(400).send("Already logged in");

  const body = JSON.parse(req.body);

  const username = body["username"];
  const password = body["password"];

  if (!username) throw new api.MissingQueryParamError("username");
  if (!password) throw new api.MissingQueryParamError("password");

  if (Array.isArray(username)) throw new api.BadQueryParamError("username", username);
  if (Array.isArray(password)) throw new api.BadQueryParamError("password", password);

  const user = await api.auth.verify(username, password);
  if (!user) return res.status(401).send("Authentication failed");

  req.session.user = user.publicAuthenticated();
  req.session.save();

  res.status(200).json(user.public());
});
