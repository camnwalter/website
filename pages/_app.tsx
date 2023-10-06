import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { Box, CssBaseline, CssVarsProvider as JoyCssVarsProvider, extendTheme } from "@mui/joy";
import {
  BreakpointsOptions,
  Experimental_CssVarsProvider as MaterialCssVarsProvider,
  experimental_extendTheme as materialExtendTheme,
  THEME_ID as MATERIAL_THEME_ID,
} from "@mui/material/styles";
import AppBar from "components/AppBar";
import type { AppProps } from "next/app";

declare module "@mui/material/styles" {
  interface BreakpointOverrides {
    mobile: true;
    tablet: true;
    desktop: true;
  }
}

declare module "@mui/joy/styles" {
  interface BreakpointOverrides {
    mobile: true;
    tablet: true;
    desktop: true;
  }
}

const breakpoints: BreakpointsOptions = {
  values: {
    // Default values (TODO: Remove?)
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,

    // Named
    mobile: 0,
    tablet: 640,
    desktop: 1000,
  },
};

const theme = extendTheme({
  colorSchemes: {
    dark: {
      palette: {
        background: {
          body: "#111",
        },
      },
    },
  },
  components: {
    JoyTabList: {
      styleOverrides: {
        root: {
          // For some reason this is 1 by default, which puts it over the VSCode editor
          zIndex: 0,
        },
      },
    },
  },
  breakpoints,
});

const materialTheme = materialExtendTheme({
  breakpoints,
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MaterialCssVarsProvider defaultMode="dark" theme={{ [MATERIAL_THEME_ID]: materialTheme }}>
      <JoyCssVarsProvider defaultMode="dark" theme={theme}>
        <CssBaseline />
        <AppBar />
        <Box display="flex" justifyContent="center">
          <Box maxWidth={1000} width="100%" p={2}>
            <Component {...pageProps} />
          </Box>
        </Box>
      </JoyCssVarsProvider>
    </MaterialCssVarsProvider>
  );
}
