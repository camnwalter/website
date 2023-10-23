import { getAllowedVersions } from "app/api";
import { getOnePublic } from "app/api/modules";
import { notFound } from "next/navigation";
import type { SlugProps } from "utils/next";

import UploadReleaseComponent from "./UploadReleaseComponent";

export default async function Page({ params }: SlugProps<"nameOrId">) {
  const { modVersions } = await getAllowedVersions();

  return (
    <UploadReleaseComponent
      module={(await getOnePublic(params.nameOrId)) ?? notFound()}
      validModVersions={modVersions}
    />
  );
}
