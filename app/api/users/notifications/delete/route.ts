import { BadQueryParamError, ClientError, MissingQueryParamError, route } from "app/api";
import { getDb, Notification } from "app/api/db";

/**
 * {
 *   "id": string,
 *   "user_id": string,
 * }
 */
export const DELETE = route(async req => {
  if (req.headers.get("content-type") !== "application/json")
    return new Response("Expected application/json", { status: 400 });

  const body = await req.json();

  if (typeof body !== "object" || Array.isArray(body))
    throw new ClientError("Malformed body JSON data");

  const id = body.id;
  const user_id = body.user_id;

  if (!id) throw new MissingQueryParamError("id");
  if (!user_id) throw new MissingQueryParamError("user_id");

  if (typeof id !== "string") throw new BadQueryParamError("id", id);
  if (typeof user_id !== "string") throw new BadQueryParamError("user_id", user_id);

  const db = await getDb();
  const notifs = db.getRepository(Notification);
  const notif = await notifs
    .createQueryBuilder("notification")
    .where("id = :id", { id })
    .andWhere("user_id = :user_id", { user_id })
    .getOne();

  if (notif) {
    notifs.remove(notif);
  }

  return new Response("Deleted notification");
});
