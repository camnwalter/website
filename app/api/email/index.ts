import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { fromEnv } from "@aws-sdk/credential-providers";

interface Mail {
  timestamp: string;
  source: string;
  sourceArn: string;
  sourceIp: string;
  callerIdentity: string;
  sendingAccountId: string;
  messageId: string;
  destination: string[];
}

interface Delivery {
  notificationType: "Delivery";
  mail: Mail;
  delivery: {
    timestamp: string;
    processingTimeMillis: number;
    recipients: string[];
    smtpResponse: string;
    remoteMtaIp: string;
    reportingMTA: string;
  };
}

interface Bounce {
  notificationType: "Bounce";
  bounce: {
    feedbackId: string;
    bounceType: "Undetermined" | "Transient" | "Permanent";
    bounceSubType:
      | "Undetermined"
      | "General"
      | "NoEmail"
      | "Suppressed"
      | "OnAccountSuppressionList"
      | "MailboxFull"
      | "MessageTooLarge"
      | "ContentRejected"
      | "AttachmentRejected";
    bouncedRecipients: {
      emailAddress: string;
      action?: string;
      status?: string;
      diagnosticCode?: string;
    }[];
    timestamp: string;
    remoteMtaIp?: string;
    reportingMTA?: string;
  };
  mail: Mail;
}

interface Complaint {
  notificationType: "Complaint";
  complaint: {
    feedbackId: string;
    complaintSubType: string;
    complainedRecipients: {
      emailAddress: string;
    }[];
    timestamp: string;
    userAgent?: string;
    complaintFeedbackType?: string;
    arrivalDate?: string;
  };
  mail: Mail;
}

export type MailMessage = Delivery | Bounce | Complaint;

export interface MailNotification {
  Type: string;
  MessageId: string;
  Message: string; // JSON-encoded MailMessage
  Timsetamp: string;
  SignatureVersion: string;
  Signature: string;
  SigningCertURL: string;
  UnsubscribeURL: string;
}

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
