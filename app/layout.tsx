import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "reflect-metadata";

import { Box, CssBaseline } from "@mui/joy";
import type { Metadata } from "next";

import AppBar from "./AppBar";
import ThemeRegistry from "./ThemeRegistry";

export const metadata: Metadata = {
  title: "ChatTriggers",
};

interface Props {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <CssBaseline />
          <AppBar />
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
