import { ClientError, getFormData, getFormEntry, route } from "app/api/(utils)";
import { db, User } from "app/api/db";
import { isPasswordValid } from "app/constants";
import bcrypt from "bcrypt";
import type { NextRequest } from "next/server";

export const POST = route(async (req: NextRequest) => {
  const form = await getFormData(req);
  const email = getFormEntry({ form, name: "email", type: "string" });
  const password = getFormEntry({ form, name: "password", type: "string" });
  const token = getFormEntry({ form, name: "token", type: "string" });

  const userRepo = db().getRepository(User);
  const user = await userRepo.findOneBy({ email });

  // Intentionally vague errors so a user can't use this endpoint to query email addresses
  if (!user) throw new ClientError("Invalid email or token");
  if (user.passwordResetToken !== token) throw new ClientError("Invalid email or token");

  if (!isPasswordValid(password))
    throw new ClientError("Password must be at least 8 character long");

  user.password = await bcrypt.hash(password, await bcrypt.genSalt());
  user.passwordResetToken = null;
  await userRepo.save(user);

  return new Response();
});
