import type { SearchParamProps } from "app/(utils)/next";
import { getDb, User } from "app/api/db";

import InitiateResetComponent from "./InitiateResetComponent";
import InvalidTokenComponent from "./InvalidTokenComponent";
import ResetPasswordComponent from "./ResetPasswordComponent";

export default async function Page({ searchParams }: SearchParamProps) {
  const token = searchParams.token;
  if (typeof token === "string") {
    const db = await getDb();
    const user = await db.getRepository(User).findOneBy({ passwordResetToken: token });
    if (!user) return <InvalidTokenComponent />;
    if (user.passwordResetToken !== token) return <InvalidTokenComponent />;
    return <ResetPasswordComponent email={user.email} token={token} />;
  }

  return <InitiateResetComponent />;
}
