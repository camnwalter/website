import { Box } from "@mui/joy";
import Body from "components/modules/Body";
import Header from "components/modules/Header";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import * as api from "utils/api";
import type { PublicModule } from "utils/db";
import { deleteUndefined } from "utils/next";

export default function Module(module: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Box my={{ md: 5 }} width="100%">
      <Header module={module} />
      <Body module={module} />
    </Box>
  );
}

export const getServerSideProps = (async ctx => {
  const result = await api.modules.getOnePublic(ctx.query.nameOrId as string);
  if (!result) return { notFound: true };
  return { props: deleteUndefined(result) };
}) satisfies GetServerSideProps<PublicModule>;
