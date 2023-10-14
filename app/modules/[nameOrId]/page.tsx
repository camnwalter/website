import * as modules from "app/api/modules";
import { notFound } from "next/navigation";
import type { SlugProps } from "utils/next";

import ModuleComponent from "./ModuleComponent";

export default async function Page({ params }: SlugProps<"nameOrId">) {
  try {
    return <ModuleComponent module={await modules.getOnePublic(params.nameOrId)} />;
  } catch {
    notFound();
  }
}
