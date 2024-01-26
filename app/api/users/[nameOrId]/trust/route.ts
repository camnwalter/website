import type { SlugProps } from "app/(utils)/next";
import { ForbiddenError, getSessionFromRequest, route } from "app/api";
import { getDb, Rank, User } from "app/api/db";
import type { NextRequest } from "next/server";

export const POST = route(async (req: NextRequest, { params }: SlugProps<"nameOrId">) => {
  const sessionUser = getSessionFromRequest(req);
  if (!sessionUser || sessionUser.rank !== Rank.ADMIN) throw new ForbiddenError("No permission");

  const db = await getDb();
  const userRepo = db.getRepository(User);

  const user = await userRepo
    .createQueryBuilder("user")
    .where("id = :id", { id: params.nameOrId })
    .orWhere("name = :name", { name: params.nameOrId })
    .execute();

  if (!user) return new Response("User not found", { status: 404 });

  if (user.rank === Rank.DEFAULT) user.rank = Rank.TRUSTED;
  else if (user.rank === Rank.TRUSTED) user.rank = Rank.DEFAULT;

  await userRepo.save(user);

  return Response.json({ new_rank: user.rank });
});
