import { Box } from "@mui/joy";
import Body from "components/modules/Body";
import Header from "components/modules/Header";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import * as api from "utils/api";
import { deleteUndefined } from "utils/next";
import type { Module } from "utils/types";

interface Props {
  module: Module;
}

export default function Module({ module }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Box my={{ md: 5 }} width="100%">
      <Header module={module} />
      <Body module={module} />
    </Box>
  );
}

export const getServerSideProps = (async ctx => {
  const result = await api.modules.getOne(ctx.query.nameOrId as string);
  if (!result) return { notFound: true };
  return { props: { module: deleteUndefined(result) } };
}) satisfies GetServerSideProps<Props>;
