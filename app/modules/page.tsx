import { getSessionFromCookies, toParams } from "app/api";
import * as apiModules from "app/api/modules";
import { cookies } from "next/headers";
import type { SearchParamProps } from "utils/next";

import ModulesComponent from "./ModuleComponent";

export default async function Page({ searchParams }: SearchParamProps) {
  const sessionUser = getSessionFromCookies(cookies());

  const { modules, meta } = await apiModules.getManyPublic(
    toParams({
      ...searchParams,
      limit: "50",
      hidden: sessionUser ? apiModules.Hidden.ALL : apiModules.Hidden.NONE,
    }),
  );

  return <ModulesComponent modules={modules} meta={meta} />;
}
