import { route } from "app/api";
import { db, Email, EmailType } from "app/api/db";

import type { MailMessage, MailNotification } from "..";

export const POST = route(async req => {
  const repo = db.getRepository(Email);

  const message: MailNotification = await req.json();
  const body: MailMessage = JSON.parse(message.Message);

  if (body.notificationType === "Bounce") {
    // Ignore non-permanent bounces. If the address isn't available, this bounce can't be processed
    if (body.bounce.bounceType === "Permanent" && body.bounce.bounceSubType !== "NoEmail") {
      for (const recipient of body.bounce.bouncedRecipients) {
        const entry = new Email();
        entry.type = EmailType.BOUNCE;
        entry.subtype = body.bounce.bounceSubType;
        entry.recipient = recipient.emailAddress;
        entry.timestamp = body.bounce.timestamp;
        repo.save(entry);
      }
    }
  } else if (body.notificationType === "Complaint") {
    for (const recipient of body.complaint.complainedRecipients) {
      const entry = new Email();
      entry.type = EmailType.COMPLAINT;
      entry.subtype = body.complaint.complaintSubType;
      entry.recipient = recipient.emailAddress;
      entry.timestamp = body.complaint.timestamp;
      repo.save(entry);
    }
  } else if (body.notificationType === "Delivery") {
    for (const recipient of body.delivery.recipients) {
      const entry = new Email();
      entry.type = EmailType.DELIVERY;
      entry.recipient = recipient;
      entry.timestamp = body.delivery.timestamp;
      repo.save(entry);
    }
  }

  return new Response(null, { status: 200 });
});
