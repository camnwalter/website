import { getSessionFromCookies } from "app/api";
import * as modules from "app/api/modules";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { SlugProps } from "utils/next";

import ModuleComponent from "./ModuleComponent";

export default async function Page({ params }: SlugProps<"nameOrId">) {
  const user = getSessionFromCookies(cookies());

  return (
    <ModuleComponent
      module={(await modules.getOnePublic(params.nameOrId)) ?? notFound()}
      user={user}
    />
  );
}
