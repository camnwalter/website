import { ClientError } from "app/api";
import { db, User } from "app/api/db";
import bcrypt from "bcrypt";
import sharp from "sharp";

export const verify = async (username: string, password: string): Promise<User | undefined> => {
  const user = await db
    .getRepository(User)
    .createQueryBuilder("user")
    .where("user.name = :name", { name: username })
    .orWhere("user.email = :email", { email: username })
    .getOne();

  if (user && bcrypt.compareSync(password, user.password)) return user;
};

// TODO: Deduplicate this with the one for modules

const MAX_IMAGE_SIZE = 1000;

export const saveImage = async (user: User, file: string | Blob) => {
  if (typeof file === "string") throw new ClientError("User image must be a file");

  const image = await sharp(await file.arrayBuffer());
  let { width, height } = await image.metadata();
  if (!width || !height) throw new Error(`Unable to get metadata for image`);

  if (width > MAX_IMAGE_SIZE) {
    height /= width / MAX_IMAGE_SIZE;
    width = MAX_IMAGE_SIZE;
  }

  if (height > MAX_IMAGE_SIZE) {
    width /= height / MAX_IMAGE_SIZE;
    height = MAX_IMAGE_SIZE;
  }

  image.resize(Math.floor(width), Math.floor(height), { fit: "contain" });
  await image.png().toFile(`public/assets/users/${user.name}.png`);
  user.image = `/assets/users/${user.name}.png`;
};
