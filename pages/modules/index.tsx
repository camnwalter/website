import {
  Box,
  FormControl,
  FormLabel,
  Option,
  Select,
  Sheet,
  Stack,
  Typography,
  useColorScheme,
} from "@mui/joy";
import { Pagination } from "@mui/material";
import Header from "components/modules/Header";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import * as api from "utils/api";
import { deleteUndefined } from "utils/next";
import { Module, Sort } from "utils/types";

const MODULES_PER_PAGES = 50;

interface Props {
  modules: Module[];
  total: number;
  offset: number;
  sort: Sort;
}

export default function Modules({
  modules,
  total,
  offset,
  sort,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const { mode: currMode, systemMode } = useColorScheme();
  const mode = currMode === "system" ? systemMode : currMode;

  const handleChangePage = (_event: unknown, newPage: number) => {
    router.replace({ query: { ...router.query, offset: (newPage - 1) * MODULES_PER_PAGES } });
  };

  const handleChangeSort = (_event: unknown, newSort: Sort | null) => {
    router.replace({ query: { ...router.query, sort: newSort ?? undefined } });
  };

  return (
    <Stack my={3}>
      <Sheet
        variant="solid"
        sx={{
          display: "flex",
          justifyContent: "center",
          borderRadius: 5,
          width: "100%",
          mb: 3,
          backgroundColor: mode === "light" ? "rgb(230, 234, 238)" : "#333",
        }}
      >
        <Typography level="h1" p={3}>
          All Modules
        </Typography>
      </Sheet>
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
    await api.modules.getMany({ ...ctx.query, limit: MODULES_PER_PAGES.toString() }),
  ),
})) satisfies GetServerSideProps<Props>;
