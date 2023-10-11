"use client";

import { Box } from "@mui/joy";
import type { PublicModule } from "app/api/db";

import Body from "../Body";
import Header from "../Header";

export default function Module(module: PublicModule) {
  return (
    <Box my={{ md: 5 }} width="100%">
      <Header module={module} />
      <Body module={module} />
    </Box>
  );
}
