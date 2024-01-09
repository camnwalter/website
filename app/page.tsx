import { Book, ChevronRight, Download } from "@mui/icons-material";
import {
  AspectRatio,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Sheet,
  Stack,
  Typography,
} from "@mui/joy";
import { cookies } from "next/headers";
import type { StaticImageData } from "next/image";
import Link from "next/link";
import javascript from "public/JavaScript.png";
import { Fragment } from "react";
import { In } from "typeorm";

import { cached, getSessionFromCookies } from "./api";
import type { AuthenticatedUser } from "./api/db";
import { db, Module, Release, User } from "./api/db";
import { getStats } from "./api/statistics/route";
import AppBarIcons from "./appbar/AppBarIcons";
import CTLogo from "./appbar/CTLogo";
import SearchBar from "./appbar/SearchBar";

interface Props {
  user?: AuthenticatedUser;
}

function FakeAppBar({ user }: Props) {
  return (
    <Stack
      direction="row"
      mt={1}
      px={2}
      maxWidth={1000}
      width="100%"
      display="flex"
      alignContent="center"
      alignItems="center"
      justifyContent="space-between"
      justifyItems="center"
      flexWrap="wrap"
    >
      <CTLogo />
      <Box display="flex">
        <AppBarIcons user={user} />
      </Box>
    </Stack>
  );
}

function Header({ user }: Props) {
  return (
    <Box
      sx={{
        m: 0,
        p: 0,
        width: "100vw",
        backgroundColor: "#7e57c2",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box maxWidth={1000} width="100%" display="flex" alignItems="center" flexDirection="column">
        <FakeAppBar user={user} />
        <Typography level="h1" sx={{ fontSize: 72, color: "white", mt: 5 }}>
          ChatTriggers
        </Typography>
        <Typography level="title-lg" sx={{ mt: 2, mb: 4, color: "white" }}>
          A Minecraft framework for live scripting using JavaScript.
        </Typography>
        <Box width="100%" maxWidth={500}>
          <SearchBar placeholder="Search Modules" sx={{ mb: 5 }} large />
        </Box>
      </Box>
    </Box>
  );
}

interface LinkProps {
  title: string;
  description: string;
  image: StaticImageData;
}

function LinkCard({ title, description, image }: LinkProps) {
  return (
    <Card variant="soft" sx={{ maxWidth: 250 }}>
      <AspectRatio ratio="1">
        <img src={image.src} />
      </AspectRatio>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <Typography level="title-lg">{title}</Typography>
          <Typography level="body-md">{description}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

interface NumericStatProps {
  title: string;
  value: number;
}

function NumericStat({ title, value }: NumericStatProps) {
  return (
    <Box sx={{ width: 170 }}>
      <Typography level="body-lg" fontSize={36} sx={{ textAlign: "center" }}>
        {value.toLocaleString()}
      </Typography>
      <Typography sx={{ width: "100%", textAlign: "center" }}>{title}</Typography>
    </Box>
  );
}

// Recalculate the home page info every 5 minutes
const cachedStats = cached(10, async () => {
  const moduleRepo = db.getRepository(Module);
  const releaseRepo = db.getRepository(Release);

  // TODO: I can do this in one query with raw SQL, but can't seem to manage it with TypeORM. There
  //       has to be a way...
  const newModuleIds = (
    await releaseRepo
      .createQueryBuilder("release")
      .leftJoinAndSelect("release.module", "module")
      .select("module.id")
      .distinct(true)
      .orderBy("module.created_at", "DESC")
      .limit(10)
      .getRawMany()
  ).map(m => m.module_id);

  const newModules = await moduleRepo.find({
    where: {
      id: In(newModuleIds),
    },
    order: {
      created_at: "desc",
    },
    relations: {
      releases: true,
    },
  });

  // TODO: Verify creating a release actually update Module.updated_at
  const updatedModuleIds = (
    await releaseRepo
      .createQueryBuilder("release")
      .leftJoinAndSelect("release.module", "module")
      .select("module.id")
      .distinct(true)
      .orderBy("module.updated_at", "DESC")
      .limit(10)
      .getRawMany()
  ).map(m => m.module_id);

  const updatedModules = await moduleRepo.find({
    where: {
      id: In(updatedModuleIds),
    },
    order: {
      updated_at: "desc",
    },
    relations: {
      releases: true,
    },
  });

  // Modules can't have downloads without releases, so no need to check for that
  const popularModules = await moduleRepo.find({
    order: { downloads: "desc" },
    take: 10,
    relations: {
      releases: true,
    },
  });

  return {
    stats: await getStats(),
    newModules,
    updatedModules,
    popularModules,
  };
});

function ModuleCard({ module }: { module: Module }) {
  return (
    <Link href={`/modules/${module.name}`} style={{ textDecoration: "none" }}>
      <Sheet
        variant="soft"
        sx={{
          my: 1,
          mx: 5,
          p: 2,
          borderRadius: 5,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography sx={{ textAlign: "start" }}>{module.name}</Typography>
          <Box sx={{ display: "flex", gap: 1, verticalAlign: "center" }}>
            <Typography sx={{ fontSize: 12, width: 25 }}>
              {module.releases.at(-1)?.release_version}
            </Typography>
            <Typography sx={{ fontSize: 12 }}> | </Typography>
            <Typography sx={{ fontSize: 12 }}>{module.user.name}</Typography>
          </Box>
        </Box>
        <ChevronRight />
      </Sheet>
    </Link>
  );
}

export default async function Page() {
  const session = getSessionFromCookies(cookies());
  const user = session ? await db.getRepository(User).findOneBy({ id: session.id }) : undefined;
  const { stats, newModules, updatedModules, popularModules } = await cachedStats();

  return (
    <>
      <Header user={user?.publicAuthenticated()} />
      <Box
        sx={{
          mt: 7,
          p: 0,
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyItems: "center",
          alignContent: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 1000,
            display: "flex",
            alignItems: "center",
            justifyItems: "center",
            alignContent: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: { mobile: 2, tablet: 4 },
              flexDirection: { mobile: "column", tablet: "row" },
            }}
          >
            <Button startDecorator={<Download />} sx={{ fontSize: 18 }}>
              Download
            </Button>
            <Button startDecorator={<Book />} sx={{ fontSize: 18 }}>
              Getting Started
            </Button>
          </Box>
          <Divider sx={{ mt: 4, width: "70%", left: "15%" }} />
          <Box
            sx={{
              mt: 3,
              display: "flex",
              flexDirection: { mobile: "column", tablet: "row" },
              alignItems: "center",
              justifyItems: "center",
              alignContent: "center",
              justifyContent: "center",
              gap: { mobile: 1, tablet: 4 },
            }}
          >
            <NumericStat title="Imports" value={stats.totalImports} />
            <NumericStat title="Modules" value={stats.moduleCount} />
            <NumericStat title="Releases" value={stats.releaseCount} />
          </Box>
          <Grid container sx={{ mt: 5 }}>
            <Grid xs={4}>
              <Typography level="body-lg" sx={{ textAlign: "center", fontSize: 22 }}>
                <b>Most Imported</b>
              </Typography>
            </Grid>
            <Grid xs={4}>
              <Typography level="body-lg" sx={{ textAlign: "center", fontSize: 22 }}>
                <b>Recently Updated</b>
              </Typography>
            </Grid>
            <Grid xs={4}>
              <Typography level="body-lg" sx={{ textAlign: "center", fontSize: 22 }}>
                <b>Recently Created</b>
              </Typography>
            </Grid>
            <Grid xs={12} sx={{ mb: 3 }} />
            {[...Array(10).keys()].map(i => {
              return (
                <Fragment key={i}>
                  <Grid xs={4}>
                    <ModuleCard module={popularModules[i]} />
                  </Grid>
                  <Grid xs={4}>
                    <ModuleCard module={updatedModules[i]} />
                  </Grid>
                  <Grid xs={4}>
                    <ModuleCard module={newModules[i]} />
                  </Grid>
                </Fragment>
              );
            })}
          </Grid>
        </Box>
      </Box>
    </>
  );
}
