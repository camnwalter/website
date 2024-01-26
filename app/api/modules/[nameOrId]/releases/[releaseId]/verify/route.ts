import type { SlugProps } from "app/(utils)/next";
import {
  ClientError,
  ConflictError,
  getFormData,
  getFormEntry,
  getSessionFromRequest,
  NotAuthenticatedError,
  NotFoundError,
  route,
} from "app/api";
import { deleteReleaseVerificationMessage } from "app/api/(utils)/webhooks";
import { getDb, Notification, Rank, Release } from "app/api/db";
import * as modules from "app/api/modules";
import * as users from "app/api/users";

export const POST = route(async (req, { params }: SlugProps<"nameOrId" | "releaseId">) => {
  const { nameOrId, releaseId } = params;

  const session = getSessionFromRequest(req);
  if (!session || session.rank === Rank.DEFAULT) throw new NotAuthenticatedError("No permission");
  const sessionUser = await users.getUser(session.id);
  if (!sessionUser) throw new NotAuthenticatedError("No permission");

  const module_ = await modules.getOne(nameOrId);
  if (!module_) throw new NotFoundError("Invalid module");

  const release = module_.releases.find(r => r.id === releaseId);
  if (!release) throw new NotFoundError("Invalid release");

  if (release.verified) throw new ConflictError("Release is already verified");

  const form = await getFormData(req);
  const verified = getFormEntry({ form, name: "verified", type: "boolean" });
  const reason = getFormEntry({ form, name: "reason", type: "string", optional: true });

  if (!verified && !reason) throw new ClientError("Must include a reason when rejecting a release");

  const notification = new Notification();
  notification.user = module_.user;

  const db = await getDb();
  if (verified) {
    notification.title = `Release v${release.release_version} for module ${module_.name} has been verified`;
    release.verified = true;
    release.verified_by = sessionUser;
    release.verified_at = new Date();
  } else {
    notification.title = `Release v${release.release_version} for module ${module_.name} has been rejected`;
    notification.description =
      "Your release has been rejected, as it is not suitable for publication. If you have any questions, " +
      "please contact us on our Discord server.\n\nReason given for rejection: " +
      reason;

    db.getRepository(Release).remove(release);
  }

  deleteReleaseVerificationMessage(release);

  module_.user.notifications.push(notification);
  db.getRepository(Notification).save(notification);

  if (verified) return new Response("Release verified");
  return new Response("Release rejected");
});
