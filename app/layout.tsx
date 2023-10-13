import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import "reflect-metadata";

import { Box, CssBaseline } from "@mui/joy";
import type { Metadata } from "next";
import { cookies } from "next/headers";

import { getSessionFromCookies } from "./api";
import AppBar from "./AppBar";
import ThemeRegistry from "./ThemeRegistry";

export const metadata: Metadata = {
  title: "ChatTriggers",
};

interface Props {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Props) {
  const user = getSessionFromCookies(cookies());

  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <CssBaseline />
          <AppBar user={user} />
          <Box display="flex" justifyContent="center">
            <Box maxWidth={1000} width="100%" p={2}>
              {children}
            </Box>
          </Box>
        </ThemeRegistry>
      </body>
    </html>
  );
}
