import {
  BadQueryParamError,
  getFormData,
  getFormEntry,
  route,
  sendPasswordResetEmail,
} from "app/api/(utils)";
import { User, getDb } from "app/api/db";
import { isEmailValid } from "app/constants";
import type { NextRequest } from "next/server";

export const POST = route(async (req: NextRequest) => {
  const form = await getFormData(req);
  const email = getFormEntry({ form, name: "email", type: "string" });

  if (!isEmailValid(email)) throw new BadQueryParamError("email", email);

  const db = await getDb();
  const user = await db.getRepository(User).findOneBy({ email });
  if (!user) {
    // Do not return an error since that would provide information to the user
    return new Response();
  }

  await sendPasswordResetEmail(user);
  return new Response();
});
