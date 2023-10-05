import { EventNote, EventRepeat } from "@mui/icons-material";
import Download from "@mui/icons-material/Download";
import { Box, Sheet, Stack, Tooltip, Typography } from "@mui/joy";
import Markdown from "marked-react";
import type { Module } from "utils/types";

interface HeaderProps {
  module: Module;
  summary?: string;
}

export default function Header({ module, summary }: HeaderProps) {
  const totalDownloads = module.releases.reduce((sum, r) => sum + r.downloads, 0);

  return (
    <Sheet variant="soft" sx={{ padding: 2, borderRadius: 4 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between">
        <Stack spacing={2} ml={1}>
          <Stack direction="row" alignItems="center" justifyContent="start" spacing={2}>
            <Typography level="h2" noWrap>
              {module.name}
            </Typography>
            <Typography level="body-sm" noWrap>
              by {module.owner.name}
            </Typography>
          </Stack>
          {summary && <Markdown>{summary}</Markdown>}
          <Stack direction="row" alignItems="center" justifyContent="start" spacing={4}>
            {module.tags.map(tag => (
              <Typography key={tag} level="body-md">
                #{tag}
              </Typography>
            ))}
          </Stack>
        </Stack>
        <Stack direction="row">
          {module.image && (
            <Box display="flex" alignItems="center" mt={{ xs: 2, md: 0 }} mx={3}>
              <img
                src={module.image}
                alt="module image"
                style={{ maxHeight: 130, objectFit: "contain", maxWidth: 250, borderRadius: 6 }}
              />
            </Box>
          )}
          <Stack display="flex" alignItems="start" mr={3} justifyContent="center" spacing={2}>
            <Box display="flex" flexDirection="row" alignContent="center" alignItems="center">
              <Download fontSize="small" />
              <Typography pl={1} level="body-sm" whiteSpace="nowrap">
                Downloads: {totalDownloads.toLocaleString()}
              </Typography>
            </Box>
            <Tooltip
              suppressHydrationWarning
              title={new Date(module.createdAt).toLocaleTimeString()}
              placement="top"
              arrow
            >
              <Box display="flex" flexDirection="row" alignContent="center" alignItems="center">
                <EventNote fontSize="small" />
                <Typography pl={1} suppressHydrationWarning level="body-sm" whiteSpace="nowrap">
                  Created: {new Date(module.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Tooltip>
            <Tooltip
              suppressHydrationWarning
              title={new Date(module.updatedAt).toLocaleTimeString()}
              arrow
            >
              <Box display="flex" flexDirection="row" alignContent="center" alignItems="center">
                <EventRepeat fontSize="small" />
                <Typography pl={1} suppressHydrationWarning level="body-sm" whiteSpace="nowrap">
                  Updated: {new Date(module.updatedAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Tooltip>
          </Stack>
        </Stack>
      </Stack>
    </Sheet>
  );
}
