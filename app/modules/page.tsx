import { toParams } from "app/api";
import * as apiModules from "app/api/modules";
import type { SearchParamProps } from "utils/next";

import ModulesComponent from "./ModuleComponent";

export default async function Page({ searchParams }: SearchParamProps) {
  const { modules, meta } = await apiModules.getManyPublic(
    toParams({
      ...searchParams,
      limit: "50",
    }),
  );

  return <ModulesComponent modules={modules} meta={meta} />;
}
