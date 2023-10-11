import * as api from "utils/api";

export default api.handler(async (req, res) => {
  if (req.session) {
    res.status(200).json(req.session.user);
  } else {
    res.status(401).send("Not logged in");
  }
});
