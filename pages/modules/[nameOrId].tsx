import { Download, ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Divider,
  Sheet,
  Stack,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Typography,
} from "@mui/joy";
import { marked } from "marked";
import Markdown from "marked-react";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getModuleFromNameOrId } from "utils/db";
import type { Module, Release } from "utils/types";

interface HeaderProps {
  name: string;
  author: string;
  summary?: string;
  tags: string[];
  image?: string;
}

function Header({ name, author, summary, tags, image }: HeaderProps) {
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
        <Box sx={{ alignSelf: "center", mt: { xs: 2, md: 0 } }}>
          <img
            src={image}
            alt="module image"
            style={{ maxHeight: "130px", objectFit: "contain", maxWidth: 320 }}
          />
        </Box>
      </Stack>
    </Sheet>
  );
}

interface ReleaseCardProps {
  release: Release;
}

function ReleaseCard({ release }: ReleaseCardProps) {
  return (
    <Accordion sx={{ my: 1 }}>
      <AccordionSummary indicator={<ExpandMore />}>
        <Stack direction="row" alignContent="center" spacing={4}>
          <Typography level="title-lg">v{release.releaseVersion}</Typography>
          <Typography>for ct {release.modVersion}</Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Download />
            <Typography>{release.downloads}</Typography>
          </Stack>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Divider />
        <Markdown>{release.changelog}</Markdown>
      </AccordionDetails>
    </Accordion>
  );
}

interface BodyProps {
  module: Module;
  description?: string;
}

function Body({ module, description }: BodyProps) {
  return (
    <Tabs variant="soft" sx={{ marginTop: 3 }}>
      <TabList>
        <Tab>Description</Tab>
        {module.releases.length > 0 && <Tab>{module.releases.length} Releases</Tab>}
      </TabList>
      <TabPanel value={0}>{description && <Markdown>{description}</Markdown>}</TabPanel>
      {module.releases.length > 0 && (
        <TabPanel value={1}>
          <AccordionGroup variant="plain" transition="0.2s ease">
            {module.releases.map(release => (
              <ReleaseCard key={release.id} release={release} />
            ))}
          </AccordionGroup>
        </TabPanel>
      )}
    </Tabs>
  );
}

interface Props {
  module: Module;
}

export default function Module({ module }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  console.log(module.tags);
  const { summary, description } = splitDescription(module.name, module.description);

  return (
    <Box sx={{ p: { md: 5 } }} maxWidth={1000}>
      <Header
        name={module.name}
        author={module.owner.name}
        summary={summary}
        tags={module.tags}
        image={module.image}
      />
      <Body module={module} description={description} />
    </Box>
  );
}

// TODO: Make this better?
function splitDescription(
  moduleName: string,
  rawDescription: string,
): {
  summary?: string;
  description?: string;
} {
  const tokens = marked.lexer(rawDescription);
  let summary: string | undefined;
  let description = rawDescription;

  if (tokens.length > 0 && "text" in tokens[0]) {
    summary = tokens[0].text;
    if (summary?.trim() === moduleName) {
      summary = undefined;
    } else {
      description = description.replace(tokens[0].raw, "").trim();
    }
  }

  return { summary, description };
}

export const getServerSideProps = (async ctx => {
  const module = await getModuleFromNameOrId(ctx.query.nameOrId as string);
  if (!module) return { notFound: true };
  return { props: { module } };
}) satisfies GetServerSideProps<Props>;
