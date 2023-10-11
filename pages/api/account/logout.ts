import * as api from "utils/api";

export default api.withSessionRoute(async (req, res) => {
  req.session.destroy();
  res.status(200).send("Logged out");
});
