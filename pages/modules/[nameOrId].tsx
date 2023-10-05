import { Box } from "@mui/joy";
import Body from "components/modules/Body";
import Header from "components/modules/Header";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import * as api from "utils/api";
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
  const module = await api.modules.getOne(ctx.query.nameOrId as string);
  if (!module) return { notFound: true };
  return { props: { module } };
}) satisfies GetServerSideProps<Props>;
