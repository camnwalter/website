import type { SlugProps } from "app/(utils)/next";
import {
  ClientError,
  ConflictError,
  ForbiddenError,
  NotAuthenticatedError,
  NotFoundError,
  db,
  getFormData,
  getFormEntry,
  getSessionFromRequest,
  route,
} from "app/api";
import { type Notification, Rank } from "app/api";
import { deleteReleaseVerificationMessage } from "app/api/(utils)/webhooks";
import * as modules from "app/api/modules";
import * as users from "app/api/users";
import { isUUID } from "validator";

export const POST = route(async (req, { params }: SlugProps<"nameOrId" | "releaseId">) => {
  const { nameOrId, releaseId } = params;

  const session = getSessionFromRequest(req);
  if (!session || session.rank === Rank.default) throw new NotAuthenticatedError("No permission");

  const sessionUser = await db.user.getFromSession(session);
  if (!sessionUser) throw new NotAuthenticatedError("No permission");
  if (!sessionUser.emailVerified) throw new ForbiddenError("Email not verified");

  const release = await db.release.findUnique({
    where: {
      id: releaseId,
      module: isUUID(nameOrId) ? { id: nameOrId } : { name: nameOrId },
    },
    include: {
      module: true,
    },
  });
  if (!release) throw new NotFoundError("Invalid module or release");

  if (release.verified) throw new ConflictError("Release is already verified");

  const form = await getFormData(req);
  const verified = getFormEntry({ form, name: "verified", type: "boolean" });
  const reason = getFormEntry({
    form,
    name: "reason",
    type: "string",
    optional: true,
  });

  if (!verified && !reason) throw new ClientError("Must include a reason when rejecting a release");

  const module = release.module;

  db.notification.create({
    data: {
      userId: module.userId,
      read: false,
      ...(verified
        ? {
            title: `Release v${release.releaseVersion} for module ${module.name} has been verified`,
          }
        : {
            title: `Release v${release.releaseVersion} for module ${module.name} has been rejected`,
            description: `Your release has been rejected, as it is not suitable for publication. If you have any questions, please contact us on our Discord server.\n\nReason given for rejection: ${reason}`,
          }),
    },
  });

  if (verified) {
    await db.release.update({
      where: { id: release.id },
      data: {
        verified: true,
        verifiedAt: new Date(),
        verifiedById: sessionUser.id,
      },
    });
  }

  deleteReleaseVerificationMessage(release);

  if (verified) return new Response("Release verified");
  return new Response("Release rejected");
});
