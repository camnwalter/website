import { BadQueryParamError, ClientError, MissingQueryParamError, route } from "app/api";
import { db, Notification } from "app/api/db";

/**
 * {
 *   "ids": string[],
 *   "user_id": string,
 * }
 */
export const PATCH = route(async req => {
  if (req.headers.get("content-type") !== "application/json")
    return new Response("Expected application/json", { status: 400 });

  const body = await req.json();

  if (typeof body !== "object" || Array.isArray(body))
    throw new ClientError("Malformed body JSON data");

  const ids = body.ids;
  const user_id = body.user_id;

  if (!ids) throw new MissingQueryParamError("ids");
  if (!user_id) throw new MissingQueryParamError("user_id");

  if (!Array.isArray(ids)) throw new BadQueryParamError("ids", ids);
  if (typeof user_id !== "string") throw new BadQueryParamError("user_id", user_id);

  const repo = db.getRepository(Notification);
  const notifs = await repo
    .createQueryBuilder("notification")
    .where("user_id = :user_id", { user_id })
    .andWhereInIds(ids)
    .getMany();

  for (const notif of notifs) notif.read = true;
  repo.save(notifs);

  return new Response(null, { status: 200 });
});
