import { Delete, Edit, EventNote, EventRepeat, Lock, Upload } from "@mui/icons-material";
import Download from "@mui/icons-material/Download";
import { Box, Button, ButtonGroup, Sheet, Stack, Tooltip, Typography } from "@mui/joy";
import type { AuthenticatedUser, PublicModule } from "app/api/db";
import Markdown from "marked-react";
import { useRouter } from "next/navigation";
import { switchMode } from "utils/layout";

interface HeaderProps {
  module: PublicModule;
  user?: AuthenticatedUser;
  hideUser?: boolean;
}

export default function Header({ module, user, hideUser }: HeaderProps) {
  const totalDownloads = module.releases.reduce((sum, r) => sum + r.downloads, 0);
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/modules/${module.name}/edit`);
  };

  return (
    <>
      {user && (
        <Box mb={2} width="100%" display="flex" justifyContent="center">
          <ButtonGroup spacing={2}>
            <Button startDecorator={<Edit />} onClick={handleEdit}>
              Edit Module
            </Button>
            <Button startDecorator={<Upload />}>Upload Release</Button>
            <Button startDecorator={<Delete />}>Delete Module</Button>
          </ButtonGroup>
        </Box>
      )}
      <Sheet variant="soft" sx={{ padding: 2, borderRadius: 4 }}>
        <Stack direction={{ mobile: "column", tablet: "row" }} justifyContent="space-between">
          <Stack spacing={2} ml={1}>
            <Stack direction="row" alignItems="center" justifyContent="start" spacing={2}>
              {module.hidden && (
                <Tooltip title={<Typography>This module is hidden</Typography>}>
                  <Box display="flex" alignItems="center" ml={1}>
                    <Lock />
                  </Box>
                </Tooltip>
              )}
              <Typography
                fontSize={{ mobile: 12, tablet: 24 }}
                sx={{
                  color: theme => theme.vars.palette.neutral[switchMode(100, 800)],
                }}
                noWrap
              >
                {module.name}
              </Typography>
              {hideUser && (
                <Typography level="body-sm" noWrap>
                  by {module.owner.name}
                </Typography>
              )}
            </Stack>
            {module.summary && <Markdown>{module.summary}</Markdown>}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="start"
              spacing={2}
              overflow="hidden"
            >
              {module.tags.map(tag => (
                <Typography key={tag} level="body-md">
                  #{tag}
                </Typography>
              ))}
            </Stack>
          </Stack>
          <Stack direction="row">
            {module.image && (
              <Box display={{ mobile: "none", tablet: "flex" }} alignItems="center" mx={3}>
                <img
                  src={`${process.env.NEXT_PUBLIC_WEB_ROOT}/${module.image}`}
                  alt="module image"
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
                title={new Date(module.created_at).toLocaleTimeString()}
                placement="top"
                arrow
              >
                <Box display="flex" flexDirection="row" alignContent="center" alignItems="center">
                  <EventNote fontSize="small" />
                  <Typography pl={1} suppressHydrationWarning level="body-sm" whiteSpace="nowrap">
                    Created: {new Date(module.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </Tooltip>
              <Tooltip
                suppressHydrationWarning
                title={new Date(module.updated_at).toLocaleTimeString()}
                arrow
              >
                <Box display="flex" flexDirection="row" alignContent="center" alignItems="center">
                  <EventRepeat fontSize="small" />
                  <Typography pl={1} suppressHydrationWarning level="body-sm" whiteSpace="nowrap">
                    Updated: {new Date(module.updated_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>
      </Sheet>
    </>
  );
}
