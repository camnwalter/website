import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { fromEnv } from "@aws-sdk/credential-providers";

// AWS.config.update({
//   credentials: new AWS.Credentials({
//     accessKeyId: process.env.AWS_ACCESS_KEY!,
//     secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET!,
//   }),
//   region: "us-west-1",
// });

const sesClient = new SESClient({
  credentials: fromEnv(),
  region: "us-west-1",
});

interface MailOptions {
  address: string;
  subject: string;
  html: string;
}

export const sendMail = async ({ address, subject, html }: MailOptions): Promise<void> => {
  const command = new SendEmailCommand({
    Source: "no-reply@mail.chattriggers.com",
    Destination: {
      ToAddresses: [address],
    },
    Message: {
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: html,
        },
      },
    },
  });

  await sesClient.send(command);
};
