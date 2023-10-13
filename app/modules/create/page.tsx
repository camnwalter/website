import { getTags } from "app/api/tags";

import CreateComponent from "./CreateComponent";

export default async function Page() {
  const tags = await getTags();
  return <CreateComponent tags={tags} />;
}
