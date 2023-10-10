import bcrypt from "bcrypt";
import { db, User } from "utils/db";

export const verify = async (username: string, password: string): Promise<User> => {
  const user = await db
    .getRepository(User)
    .createQueryBuilder("user")
    .where("user.name = :name", { name: username })
    .orWhere("user.email = :email", { email: username })
    .getOne();

  if (!user?.password) throw new Error("User does not have a credentials sign in");

  if (await bcrypt.compare(password, user.password)) return user;

  throw new Error("Invalid credentials");
};

export const createUser = async (
  username: string,
  email: string,
  password: string,
): Promise<User> => {
  throw new Error("Invalid username");
};
