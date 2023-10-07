import { Box, FormControl, FormLabel, Option, Select, Stack, Typography } from "@mui/joy";
import { Pagination } from "@mui/material";
import Header from "components/modules/Header";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import * as api from "utils/api";
import type { ManyResponsePublic } from "utils/api/modules";
import { Sort } from "utils/db";
import { deleteUndefined } from "utils/next";

const MODULES_PER_PAGES = 50;

export default function Modules({
  modules,
  meta: { total, offset, sort },
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  const handleChangePage = (_event: unknown, newPage: number) => {
    router.replace({ query: { ...router.query, offset: (newPage - 1) * MODULES_PER_PAGES } });
  };

  const handleChangeSort = (_event: unknown, newSort: Sort | null) => {
    router.replace({ query: { ...router.query, sort: newSort ?? undefined } });
  };

  return (
    <Stack my={2}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          mb: 3,
        }}
      >
        <Typography level="h2">All Modules</Typography>
      </Box>
      <Stack
        direction={{ mobile: "column", tablet: "row" }}
        alignItems="center"
        mx={{ mobile: 0, tablet: 5, desktop: 0 }}
        mb={2}
        justifyContent="space-between"
      >
        <Pagination
          count={Math.ceil(total / MODULES_PER_PAGES)}
          defaultPage={Math.floor(offset / MODULES_PER_PAGES) + 1}
          onChange={handleChangePage}
        />
        <FormControl>
          <Stack direction="row" spacing={1}>
            <FormLabel style={{ alignSelf: "center" }} htmlFor="sort-by-select">
              Sort by
            </FormLabel>
            <Select
              defaultValue={sort}
              slotProps={{ button: { id: "sort-by-select" } }}
              onChange={handleChangeSort}
            >
              <Option value="DATE_CREATED_DESC">🡣 Date</Option>
              <Option value="DATE_CREATED_ASC">🡡 Date</Option>
              <Option value="DOWNLOADS_DESC">🡣 Downloads</Option>
              <Option value="DOWNLOADS_ASC">🡡 Downloads</Option>
            </Select>
          </Stack>
        </FormControl>
      </Stack>
      {modules.map(module => {
        return (
          <Box key={module.id} width="100%" my={1}>
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

export const getServerSideProps = (async ctx => ({
  props: deleteUndefined(
    await api.modules.getManyPublic({ ...ctx.query, limit: MODULES_PER_PAGES.toString() }),
  ),
})) satisfies GetServerSideProps<ManyResponsePublic>;
