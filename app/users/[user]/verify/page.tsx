import type { SearchParamProps, SlugProps } from "app/(utils)/next";
import { User, db } from "app/api";
import { notFound } from "next/navigation";

import VerifyComponent from "./VerifyComponent";

export default async function Page({ searchParams, params }: SearchParamProps & SlugProps<"user">) {
  const { user } = params;
  const { token } = searchParams;

  if (!token || typeof token !== "string") notFound();
  const dbUser = await db.user.findFirst({ where: { verificationToken: token } });
  if (!dbUser || dbUser.name !== user) notFound();

  await db.user.update({
    where: {
      id: dbUser.id,
    },
    data: {
      emailVerified: true,
      verificationToken: null,
    },
  });

  return <VerifyComponent />;
}
