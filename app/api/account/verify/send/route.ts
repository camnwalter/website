import { getFormData, getFormEntry, route, sendVerificationEmail } from "app/api/(utils)";
import { User, getDb } from "app/api/db";
import type { NextRequest } from "next/server";

export const POST = route(async (req: NextRequest) => {
  const form = await getFormData(req);
  const email = getFormEntry({ form, name: "email", type: "string" });

  const db = await getDb();
  const userRepo = db.getRepository(User);
  const user = await userRepo.findOneBy({ email });

  // No error here so a user can't use this endpoint to query email addresses
  if (!user) return new Response();

  await sendVerificationEmail(user);
  return new Response();
});
