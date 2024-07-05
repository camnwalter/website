import { User, getDb } from "app/api/db";
import bcrypt from "bcrypt";

import { saveImageFile } from "../(utils)/assets";

export const verify = async (username: string, password: string): Promise<User | undefined> => {
  const db = await getDb();
  const user = await db
    .getRepository(User)
    .createQueryBuilder("user")
    .where("user.name = :name", { name: username })
    .orWhere("user.email = :email", { email: username })
    .getOne();

  if (user && bcrypt.compareSync(password, user.password)) return user;
};

export const saveImage = async (user: User, file: string | Blob) => {
  (await saveImageFile(file)).toFile(`public/assets/users/${user.name}.png`);
  user.image = `/assets/users/${user.name}.png`;
};
