import { getSessionFromCookies } from "app/api";
import * as modules from "app/api/modules";
import * as users from "app/api/users";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { SlugProps } from "utils/next";

import ModuleComponent from "./ModuleComponent";

export default async function Page({ params }: SlugProps<"nameOrId">) {
  const user = getSessionFromCookies(cookies());

  const [authedUser, module] = await Promise.all([
    user ? users.getUser(user?.id) : undefined,
    modules.getOne(params.nameOrId),
  ]);

  return (
    <ModuleComponent
      module={module?.public(module && module.user.id === user?.id) ?? notFound()}
      user={authedUser?.publicAuthenticated()}
    />
  );
}
