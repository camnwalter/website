import * as modules from "app/api/modules";
import { notFound } from "next/navigation";
import type { SlugProps } from "utils/next";

export default async function Page({ params }: SlugProps<"nameOrId">) {
  const result = (await modules.getOnePublic(params.nameOrId)) ?? notFound();
  return { props: result };
}
