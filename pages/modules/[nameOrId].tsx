import { Box } from "@mui/joy";
import Body from "components/modules/Body";
import Header from "components/modules/Header";
import { marked } from "marked";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import * as api from "utils/api";
import type { Module } from "utils/types";

// TODO: Make this better? Or just get rid of it completely
function splitDescription(
  moduleName: string,
  rawDescription: string,
): {
  summary?: string;
  description?: string;
} {
  const tokens = marked.lexer(rawDescription);
  let summary: string | undefined;
  let description = rawDescription;

  if (tokens.length > 0 && "text" in tokens[0]) {
    summary = tokens[0].text;
    if (summary?.trim() === moduleName) {
      summary = undefined;
    } else {
      description = description.replace(tokens[0].raw, "").trim();
    }
  }

  return { summary, description };
}

interface Props {
  module: Module;
}

export default function Module({ module }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { summary, description } = splitDescription(module.name, module.description);

  return (
    <Box my={{ md: 5 }} width="100%">
      <Header module={module} summary={summary} />
      <Body module={module} description={description} />
    </Box>
  );
}

export const getServerSideProps = (async ctx => {
  const module = await api.modules.getOne(ctx.query.nameOrId as string);
  if (!module) return { notFound: true };
  return { props: { module } };
}) satisfies GetServerSideProps<Props>;
