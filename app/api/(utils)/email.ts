import { randomUUID } from "node:crypto";
import { Email, User, getDb } from "app/api/db";
import { EmailParams, MailerSend, Recipient, Sender } from "mailersend";
import { In } from "typeorm";

const mailerSend = process.env.MAILERSEND_API_KEY
  ? new MailerSend({ apiKey: process.env.MAILERSEND_API_KEY })
  : undefined;

if (mailerSend && !process.env.MAILERSEND_PASSWORD_RESET_TEMPLATE_ID) {
  throw new Error(
    "The MAILERSEND_API_KEY is defined, but MAILERSEND_PASSWORD_RESET_TEMPLATE_ID is not",
  );
}
if (mailerSend && !process.env.MAILERSEND_VERIFICATION_TEMPLATE_ID) {
  throw new Error(
    "The MAILERSEND_API_KEY is defined, but MAILERSEND_VERIFICATION_TEMPLATE_ID is not",
  );
}

const sentFrom = new Sender("no-reply@chattriggers.com", "ChatTriggers");

export const sendEmail = async (recipient: string, params: EmailParams) => {
  if (!mailerSend) {
    console.log("Warning: sendEmail invoked without mailersend environment variables configured");
    return;
  }

  const db = await getDb();
  const existingBounceOrComplaint = await db.getRepository(Email).findOneBy({
    recipient,
    type: In(["bounce", "complaint"]),
  });

  if (existingBounceOrComplaint) return;

  params.setFrom(sentFrom).setTo([new Recipient(recipient)]);
  await mailerSend.email.send(params);
};

export const sendPasswordResetEmail = async (user: User) => {
  if (!mailerSend) {
    console.log(
      "Warning: sendPasswordResetEmail invoked without mailersend environment variables configured",
    );
    return;
  }

  user.passwordResetToken = randomUUID();
  const db = await getDb();
  await db.getRepository(User).save(user);

  const params = new EmailParams()
    .setTemplateId(process.env.MAILERSEND_PASSWORD_RESET_TEMPLATE_ID ?? "unreachable")
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

export const sendVerificationEmail = async (user: User) => {
  if (!mailerSend) {
    console.log(
      "Warning: sendVerificationEmail invoked without mailersend environment variables configured",
    );
    return;
  }

  user.verificationToken = randomUUID();
  const db = await getDb();
  db.getRepository(User).save(user);

  const params = new EmailParams()
    .setTemplateId(process.env.MAILERSEND_VERIFICATION_TEMPLATE_ID ?? "unreachable")
    .setVariables([
      {
        email: user.email,
        substitutions: [
          {
            var: "name",
            value: user.name,
          },
          {
            var: "verification_link",
            value: `${process.env.NEXT_PUBLIC_WEB_ROOT}/users/${user.name}/verify?token=${user.verificationToken}`,
          },
        ],
      },
    ]);

  await sendEmail(user.email, params);
};

export { EmailParams, Recipient };
