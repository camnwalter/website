import {
  BadQueryParamError,
  EmailParams,
  getFormData,
  getFormEntry,
  route,
  sendEmail,
} from "app/api/(utils)";
import { db, User } from "app/api/db";
import { isEmailValid } from "app/constants";
import type { NextRequest } from "next/server";
import { v4 as uuid } from "uuid";

export const POST = route(async (req: NextRequest) => {
  const form = await getFormData(req);
  const email = getFormEntry({ form, name: "email", type: "string" });

  if (!isEmailValid(email)) throw new BadQueryParamError("email", email);

  const user = await db.getRepository(User).findOneBy({ email });
  if (!user) {
    // Do not return an error since that would provide information to the user
    return new Response();
  }

  await sendPasswordResetEmail(user);
  return new Response();
});

const sendPasswordResetEmail = async (user: User) => {
  user.passwordResetToken = uuid();
  await db.getRepository(User).save(user);

  const params = new EmailParams()
    .setTemplateId(process.env.MAILERSEND_PASSWORD_RESET_TEMPLATE_ID!)
    .setVariables([
      {
        email: user.email,
        substitutions: [
          {
            var: "name",
            value: user.name,
          },
          {
            var: "reset_link",
            value: `${process.env.NEXT_PUBLIC_WEB_ROOT}/auth/resetpassword?token=${user.passwordResetToken}`,
          },
        ],
      },
    ]);

  await sendEmail(user.email, params);
};
