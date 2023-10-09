import { Download, EventNote } from "@mui/icons-material";
import {
  Box,
  FormControl,
  FormLabel,
  Option,
  Select,
  Sheet,
  Stack,
  Tooltip,
  Typography,
} from "@mui/joy";
import { Pagination } from "@mui/material";
import Header from "components/modules/Header";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import * as api from "utils/api";
import { ManyResponsePublic } from "utils/api/modules";
import { PublicUser, Sort } from "utils/db";

const MODULES_PER_PAGES = 25;

interface UserProps {
  user: PublicUser;
  totalDownloads: number;

  // If this is true, the user is looking at their own page and should have
  // some extra options
  authenticated: boolean;

  modules: ManyResponsePublic;
}

function UserHeader({
  user,
  totalDownloads,
  authenticated,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Sheet variant="soft" sx={{ padding: 2, borderRadius: 4, mb: 3 }}>
      <Stack direction={{ mobile: "column", tablet: "row" }} justifyContent="space-between">
        <Stack spacing={2} ml={1}>
          <Typography level="h2" fontSize={{ mobile: 16, tablet: 30 }} noWrap>
            {user.name}
          </Typography>
        </Stack>
        <Stack direction="row">
          {user.image_url && (
            <Box display={{ mobile: "none", tablet: "flex" }} alignItems="center" mx={3}>
              <img
                src={user.image_url}
                alt="user image"
                style={{ maxHeight: 100, objectFit: "contain", maxWidth: 250, borderRadius: 6 }}
              />
            </Box>
          )}
          <Stack
            display={{ mobile: "none", desktop: "flex" }}
            alignItems="start"
            mr={3}
            justifyContent="center"
            spacing={2}
          >
            <Box display="flex" flexDirection="row" alignContent="center" alignItems="center">
              <Download fontSize="small" />
              <Typography pl={1} level="body-sm" whiteSpace="nowrap">
                Downloads: {totalDownloads.toLocaleString()}
              </Typography>
            </Box>
            <Tooltip
              suppressHydrationWarning
              title={new Date(user.created_at).toLocaleTimeString()}
              placement="top"
              arrow
            >
              <Box display="flex" flexDirection="row" alignContent="center" alignItems="center">
                <EventNote fontSize="small" />
                <Typography pl={1} suppressHydrationWarning level="body-sm" whiteSpace="nowrap">
                  Created: {new Date(user.created_at).toLocaleDateString()}
                </Typography>
              </Box>
            </Tooltip>
          </Stack>
        </Stack>
      </Stack>
    </Sheet>
  );
}

export default function UserPage(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { user, userStats, authenticated, modules } = props;
  const router = useRouter();

  const handleChangePage = (_event: unknown, newPage: number) => {
    router.replace({ query: { ...router.query, offset: (newPage - 1) * MODULES_PER_PAGES } });
  };

  const handleChangeSort = (_event: unknown, newSort: Sort | null) => {
    router.replace({ query: { ...router.query, sort: newSort ?? undefined } });
  };

  return (
    <Stack my={2}>
      <UserHeader {...props} />
      <Stack
        direction={{ mobile: "column", tablet: "row" }}
        alignItems="center"
        mx={{ mobile: 0, tablet: 5, desktop: 0 }}
        mb={2}
        justifyContent="space-between"
      >
        {modules.meta.total > MODULES_PER_PAGES ? (
          <Pagination
            count={Math.ceil(modules.meta.total / MODULES_PER_PAGES)}
            defaultPage={Math.floor(modules.meta.offset / MODULES_PER_PAGES) + 1}
            onChange={handleChangePage}
          />
        ) : (
          <div />
        )}
        <FormControl>
          <Stack direction="row" spacing={1}>
            <FormLabel style={{ alignSelf: "center" }} htmlFor="sort-by-select">
              Sort by
            </FormLabel>
            <Select
              defaultValue={modules.meta.sort}
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
      {modules.modules.map(module => {
        return (
          <Box key={module.id} width="100%" my={1}>
            <Link
              href={`/modules/${module.name}`}
              style={{ textDecoration: "none", color: "inherit", outline: 0, cursor: "pointer" }}
            >
              <Header module={module} hideUser />
            </Link>
          </Box>
        );
      })}
    </Stack>
  );
}

export const getServerSideProps = (async ctx => {
  const user = await api.users.getUser(ctx.query.user as string);
  if (!user) return { notFound: true };

  const response = await api.modules.getManyPublic(ctx.req, ctx.res, {
    ...ctx.query,
    owner: user.id,
    limit: MODULES_PER_PAGES.toString(),
  });

  // TODO: Check authentication
  return {
    props: {
      user: user.public(),
      authenticated: true,
      modules: response,
      totalDownloads: await api.users.getDownloads(user),
    },
  };
}) satisfies GetServerSideProps<UserProps>;
