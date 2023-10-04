import { Box, Sheet, Stack, Typography } from "@mui/joy";
import Header from "components/modules/Header";
import { marked } from "marked";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import * as api from "utils/api";
import { Module } from "utils/types";

interface Props {
  modules: Module[];
}

export default function Modules({
  modules,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  return (
    <Stack my={{ md: 5 }}>
      <Sheet
        variant="solid"
        sx={{
          display: "flex",
          justifyContent: "center",
          borderRadius: 5,
          width: "100%",
          mb: 3,
        }}
      >
        <Typography level="h1" p={3}>
          All Modules
        </Typography>
      </Sheet>
      {modules.map(module => {
        const { summary } = splitDescription(module.name, module.description);
        return (
          <Box
            key={module.id}
            my={{ md: 1 }}
            sx={{ cursor: "pointer" }}
            width="100%"
            onClick={() => router.push(`/modules/${module.name}`)}
          >
            <Header module={module} summary={summary} />
          </Box>
        );
      })}
    </Stack>
  );
}

// TODO: Deduplicate and preferably make this a field in DBModule
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

export const getServerSideProps = (async ctx => {
  return {
    props: {
      modules: await api.modules.getMany(ctx.query),
    },
  };
}) satisfies GetServerSideProps<Props>;
