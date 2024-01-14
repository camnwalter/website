import type { SlugProps } from "app/(utils)/next";
import { getSessionFromCookies } from "app/api";
import { db, Rank, Release } from "app/api/db";
import * as modules from "app/api/modules";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import VerifyComponent from "./VerifyComponent";

export default async function Page({ params }: SlugProps<"nameOrId" | "releaseId">) {
  const session = getSessionFromCookies(cookies());
  if (!session || session.rank === Rank.DEFAULT) notFound();

  const { nameOrId, releaseId } = params;

  const module_ = (await modules.getOne(nameOrId)) ?? notFound();
  const release = module_.releases.find(r => r.id === releaseId) ?? notFound();

  const oldRelease = (
    await db()
      .getRepository(Release)
      .find({
        where: {
          module: {
            id: module_.id,
          },
          verified: false,
        },
        order: {
          release_version: "DESC",
        },
        take: 1,
      })
  )?.[0].public();

  return (
    <VerifyComponent module={module_.public()} release={release.public()} oldRelease={oldRelease} />
  );
}
