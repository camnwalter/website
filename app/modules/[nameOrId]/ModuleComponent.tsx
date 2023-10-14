"use client";

import { Box } from "@mui/joy";
import type { AuthenticatedUser, PublicModule } from "app/api/db";

import Body from "../Body";
import Header from "../Header";

interface Props {
  module: PublicModule;
  user?: AuthenticatedUser;
}

export default function Module({ module, user }: Props) {
  return (
    <Box my={{ md: 5 }} width="100%">
      <Header module={module} user={user} />
      <Body module={module} />
    </Box>
  );
}
