import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { Box, CssBaseline, CssVarsProvider as JoyCssVarsProvider, extendTheme } from "@mui/joy";
import {
  Experimental_CssVarsProvider as MaterialCssVarsProvider,
  experimental_extendTheme as materialExtendTheme,
  THEME_ID as MATERIAL_THEME_ID,
} from "@mui/material/styles";
import AppBar from "components/AppBar";
import type { AppProps } from "next/app";

const theme = extendTheme({
  cssVarPrefix: "ctjs",
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
});

const materialTheme = materialExtendTheme();

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MaterialCssVarsProvider theme={{ [MATERIAL_THEME_ID]: materialTheme }}>
      <JoyCssVarsProvider
        defaultMode="dark"
        colorSchemeSelector="#ctjs_dark-mode-by-default"
        modeStorageKey="ctjs_dark-mode-by-default"
        theme={theme}
      >
        <CssBaseline />
        <AppBar />
        <Box display="flex" justifyContent="center">
          <Box maxWidth={1000} width="100%">
            <Component {...pageProps} />
          </Box>
        </Box>
      </JoyCssVarsProvider>
    </MaterialCssVarsProvider>
  );
}
