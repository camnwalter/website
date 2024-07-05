import type { SearchParamProps, SlugProps } from "app/(utils)/next";
import { User, getDb } from "app/api/db";
import { notFound } from "next/navigation";

import VerifyComponent from "./VerifyComponent";

export default async function Page({ searchParams, params }: SearchParamProps & SlugProps<"user">) {
  const { user } = params;
  const { token } = searchParams;

  if (!token || typeof token !== "string") notFound();
  const db = await getDb();
  const userRepo = db.getRepository(User);
  const dbUser = await userRepo.findOneBy({ verificationToken: token });
  if (!dbUser || dbUser.name !== user) notFound();

  dbUser.emailVerified = true;
  dbUser.verificationToken = null;
  userRepo.save(dbUser);

  return <VerifyComponent />;
}
