import { Box, Sheet, Typography } from "@mui/joy";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { Module } from "util/types";
import * as api from "utils/api";

interface Props {
  modules: Module[];
}

export default function Modules({
  modules,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Box my={{ md: 5 }}>
      <Sheet
        variant="solid"
        sx={{
          display: "flex",
          justifyContent: "center",
          borderRadius: 5,
          width: "100%",
        }}
      >
        <Typography level="h1" p={3}>
          All Modules
        </Typography>
      </Sheet>
    </Box>
  );
}

export const getServerSideProps = (async ctx => {
  return {
    props: {
      modules: await api.modules.getMany(ctx.query),
    },
  };
}) satisfies GetServerSideProps<Props>;
