import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import "swagger-ui-react/swagger-ui.css";
import "reflect-metadata";

import { Box, CssBaseline } from "@mui/joy";
import { db, User } from "app/api/db";
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

export default async function RootLayout({ children }: Props) {
  const session = getSessionFromCookies(cookies());
  const user = session ? await db.getRepository(User).findOneBy({ id: session.id }) : undefined;

  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <CssBaseline />
          <AppBar user={user?.publicAuthenticated()} />
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
