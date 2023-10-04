import Download from "@mui/icons-material/Download";
import { Box, Button, Sheet, Stack, Typography } from "@mui/joy";
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
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="start" spacing={6}>
            <Typography level="h2" noWrap>
              {module.name}
            </Typography>
            <Typography level="body-lg" noWrap>
              by {module.owner.name}
            </Typography>
          </Stack>
          {summary && <Typography level="body-md">{summary}</Typography>}
          <Stack direction="row" alignItems="center" justifyContent="start" spacing={4}>
            {module.tags.map(tag => (
              <Typography key={tag} level="body-md">
                #{tag}
              </Typography>
            ))}
          </Stack>
        </Stack>
        <Stack direction="row">
          <Stack display="flex" alignItems="start" mr={5} justifyContent="space-between">
            <Button disabled variant="plain" startDecorator={<Download />}>
              <Typography>Downloads: {totalDownloads.toLocaleString()}</Typography>
            </Button>
            <Button disabled variant="plain" startDecorator={<Download />}>
              <Typography suppressHydrationWarning>
                Created: {new Date(module.createdAt).toLocaleDateString()}
              </Typography>
            </Button>
            <Button disabled variant="plain" startDecorator={<Download />}>
              <Typography suppressHydrationWarning>
                Updated: {new Date(module.updatedAt).toLocaleDateString()}
              </Typography>
            </Button>
          </Stack>
          {module.image && (
            <Box sx={{ alignSelf: "center", mt: { xs: 2, md: 0 } }}>
              <img
                src={module.image}
                alt="module image"
                style={{ maxHeight: "130px", objectFit: "contain", maxWidth: 320 }}
              />
            </Box>
          )}
        </Stack>
      </Stack>
    </Sheet>
  );
}
