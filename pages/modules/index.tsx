import { Box, Sheet, Stack, Typography } from "@mui/joy";
import Header from "components/modules/Header";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import * as api from "utils/api";
import { deleteUndefined } from "utils/next";
import { Module } from "utils/types";

interface Props {
  modules: Module[];
}

export default function Modules({
  modules,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
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
        return (
          <Box key={module.id} width="100%" my={{ md: 1 }}>
            <Link
              href={`/modules/${module.name}`}
              style={{ textDecoration: "none", color: "inherit", outline: 0, cursor: "pointer" }}
            >
              <Header module={module} />
            </Link>
          </Box>
        );
      })}
    </Stack>
  );
}

export const getServerSideProps = (async ctx => {
  return {
    props: {
      modules: deleteUndefined(await api.modules.getMany(ctx.query)),
    },
  };
}) satisfies GetServerSideProps<Props>;
