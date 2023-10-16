import { EmailParams } from "mailersend";
import { MailerSend, Recipient, Sender } from "mailersend";

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY!,
});

const sentFrom = new Sender("no-reply@chattriggers.com", "ChatTriggers");

export const sendEmail = async (params: EmailParams) => {
  params.setFrom(sentFrom);
  await mailerSend.email.send(params);
};

export { EmailParams, Recipient };
