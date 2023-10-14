import { getSessionFromCookies } from "app/api";
import * as modules from "app/api/modules";
import { getTags } from "app/api/tags";
import * as fs from "fs/promises";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { SlugProps } from "utils/next";

import ModuleForm from "../../ModuleForm";

export default async function Page({ params }: SlugProps<"nameOrId">) {
  const user = getSessionFromCookies(cookies());
  const targetModule = (await modules.getOne(params.nameOrId)) ?? notFound();

  if (!user || user.id !== targetModule.user.id) notFound();

  const tags = await getTags();
  return <ModuleForm editingModule={targetModule.public()} availableTags={[...tags]} />;
}
