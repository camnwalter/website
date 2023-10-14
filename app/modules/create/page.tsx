import { getTags } from "app/api/tags";

import ModuleForm from "../ModuleForm";

export default async function Page() {
  const tags = await getTags();
  return <ModuleForm availableTags={[...tags]} />;
}
