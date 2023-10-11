import { Download, Edit, EventNote } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  Option,
  Select,
  Sheet,
  Stack,
  Tooltip,
  Typography,
} from "@mui/joy";
import { Pagination } from "@mui/material";
import { USERNAME_REGEX } from "components/auth";
import Header from "components/modules/Header";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
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
  const [editOpen, setEditOpen] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(
    user.image_url ? `${process.env.NEXT_PUBLIC_WEB_ROOT}/${user.image_url}` : undefined,
  );
  const [username, setUsername] = useState(user.name);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const usernameIsValid = USERNAME_REGEX.test(username);
  const hasChanges = avatarSrc !== undefined || username !== user.name;

  const handleAvatarClick = () => {
    inputRef.current!.click();
  };

  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const file = e.target.files?.[0];
    if (file) {
      setAvatarSrc(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    const formData = new FormData();
    if (username !== user.name) formData.append("username", username);
    if (avatarSrc !== user.image_url) formData.append("image", inputRef.current!.files![0]);

    // TODO: Needs auth, also need to handle errors (username already exists)
    // await fetch("/api/account/modify", {
    //   method: "POST",
    //   body: formData,
    // });
    setTimeout(() => {
      setEditOpen(false);
    }, 1000);
  };

  return (
    <>
      <Sheet variant="soft" sx={{ padding: 2, borderRadius: 4, mb: 3 }}>
        <Stack direction={{ mobile: "column", tablet: "row" }} justifyContent="space-between">
          <Stack direction="row" spacing={2} ml={1} alignItems="center">
            <Typography level="h2" fontSize={{ mobile: 16, tablet: 30 }} noWrap>
              {user.name}
            </Typography>
            {authenticated && (
              <Box pl={3}>
                <Button
                  color="secondary"
                  size="sm"
                  startDecorator={<Edit />}
                  onClick={() => setEditOpen(true)}
                >
                  Edit Profile
                </Button>
              </Box>
            )}
          </Stack>
          <Stack direction="row">
            {user.image_url && (
              <Box display={{ mobile: "none", tablet: "flex" }} alignItems="center" mx={3}>
                <img
                  src={`${process.env.NEXT_PUBLIC_WEB_ROOT}/${user.image_url}`}
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
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        sx={{ width: "100%", height: "100%" }}
      >
        <Box
          display="flex"
          alignContent="center"
          alignItems="center"
          justifyContent="center"
          justifyItems="center"
          overflow="hidden"
          sx={{
            position: "absolute" as const,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: 10,
          }}
        >
          <Sheet sx={{ p: 6, borderRadius: 10, width: 400 }}>
            <Box width="100%" display="flex" justifyContent="center" mb={1}>
              <Box onClick={handleAvatarClick} sx={{ cursor: "pointer" }}>
                <Avatar
                  src={avatarSrc}
                  sx={{
                    width: 128,
                    height: 128,
                  }}
                />
                <input
                  type="file"
                  id="file"
                  ref={inputRef}
                  onChange={handleChangeFile}
                  style={{ display: "none" }}
                />
                <Avatar
                  size="sm"
                  sx={{
                    position: "relative",
                    left: 87,
                    top: -32,
                    backgroundColor: theme => theme.vars.palette.neutral[500],
                  }}
                >
                  <Edit fontSize="small" />
                </Avatar>
              </Box>
            </Box>
            <FormControl sx={{ mb: 3 }}>
              <FormLabel>Username</FormLabel>
              <Input
                value={username}
                error={!usernameIsValid}
                onChange={e => setUsername(e.target.value)}
              />
              {!usernameIsValid && (
                <FormHelperText>
                  Username must be between 3 and 24 characters long and consist only of letters,
                  numbers, and underscores
                </FormHelperText>
              )}
            </FormControl>
            <Stack direction="row" spacing={2} width="100%">
              <Button
                color="danger"
                variant="soft"
                sx={{ flexGrow: 1 }}
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button
                color="success"
                variant="soft"
                sx={{ flexGrow: 1 }}
                onClick={handleSubmit}
                loading={loading}
                disabled={!hasChanges}
              >
                Save
              </Button>
            </Stack>
          </Sheet>
        </Box>
      </Modal>
    </>
  );
}

export default function UserPage(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { user, authenticated, modules } = props;
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
