import type { PublicUser } from "app/api/db";
import { db, Module, User } from "app/api/db";
import { validate as uuidValidate } from "uuid";

export const getUserPublic = async (nameOrId: string): Promise<PublicUser | undefined> => {
  return (await getUser(nameOrId))?.public();
};

export const getUser = async (nameOrId: string): Promise<User | undefined> => {
  const builder = db().getRepository(User).createQueryBuilder("user");

  if (uuidValidate(nameOrId)) {
    builder.where("id = :id", { id: nameOrId });
  } else {
    builder.where("name = :name", { name: nameOrId });
  }

  return (await builder.getOne()) ?? undefined;
};

export const getDownloads = async (user: User): Promise<number> => {
  const result = await db()
    .getRepository(Module)
    .createQueryBuilder("module")
    .leftJoinAndSelect("module.user", "user")
    .where("user.id = :id", { id: user.id })
    .select("sum(module.downloads)", "downloads")
    .execute();
  return parseInt(result[0].downloads);
};
