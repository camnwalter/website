import { Book, Download } from "@mui/icons-material";
import { AspectRatio, Box, Button, Card, CardContent, Divider, Stack, Typography } from "@mui/joy";
import { cookies } from "next/headers";
import type { StaticImageData } from "next/image";
import javadocs from "public/JavaDocs.png";
import javascript from "public/JavaScript.png";
import slate from "public/Slate.png";
import { switchMode } from "utils/layout";

import { getSessionFromCookies } from "./api";
import type { AuthenticatedUser } from "./api/db";
import { db, User } from "./api/db";
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

function Intro() {
  return (
    <Box
      sx={{
        mt: 4,
        p: 0,
        width: "100vw",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Typography level="h4">New to CT? Start here</Typography>
      <Box>
        <LinkCard
          title="JavaScript"
          description="CT uses JavaScript for modules; click here to learn more"
          image={javascript}
        />
      </Box>
    </Box>
  );
}

export default async function Page() {
  const session = getSessionFromCookies(cookies());
  const user = session ? await db.getRepository(User).findOneBy({ id: session.id }) : undefined;

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
        <Box sx={{ display: "flex", gap: 4 }}>
          <Button startDecorator={<Download />} sx={{ fontSize: 18 }}>
            Download
          </Button>
          <Button startDecorator={<Book />} sx={{ fontSize: 18 }}>
            Getting Started
          </Button>
        </Box>
      </Box>
    </>
  );
}
