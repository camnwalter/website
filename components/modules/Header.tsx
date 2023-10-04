import { Box, Sheet, Stack, Typography } from "@mui/joy";

interface HeaderProps {
  name: string;
  author: string;
  summary?: string;
  tags: string[];
  image?: string;
}

export default function Header({ name, author, summary, tags, image }: HeaderProps) {
  return (
    <Sheet variant="soft" sx={{ padding: 2, borderRadius: 4 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between">
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="start" spacing={6}>
            <Typography level="h2" noWrap>
              {name}
            </Typography>
            <Typography level="body-lg" noWrap>
              by {author}
            </Typography>
          </Stack>
          {summary && <Typography level="body-md">{summary}</Typography>}
          <Stack direction="row" alignItems="center" justifyContent="start" spacing={4}>
            {tags.map(tag => (
              <Typography key={tag} level="body-md">
                #{tag}
              </Typography>
            ))}
          </Stack>
        </Stack>
        {image && (
          <Box sx={{ alignSelf: "center", mt: { xs: 2, md: 0 } }}>
            <img
              src={image}
              alt="module image"
              style={{ maxHeight: "130px", objectFit: "contain", maxWidth: 320 }}
            />
          </Box>
        )}
      </Stack>
    </Sheet>
  );
}
