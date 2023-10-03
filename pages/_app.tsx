import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import createCache from "@emotion/cache";
import { CacheProvider, EmotionCache } from "@emotion/react";
import { CssBaseline, CssVarsProvider, extendTheme, GlobalStyles, ThemeProvider } from "@mui/joy";
import { createTheme, css, PaletteOptions } from "@mui/material/styles";
import type { AppProps } from "next/app";
import Head from "next/head";

const lightTheme = createTheme({
  palette: {
    primary: { main: "#9147FF" },
    secondary: { main: "#2a48f3" },
    mode: "light",
  },
});

const darkTheme = createTheme({
  palette: {
    primary: { main: "#9147FF" },
    secondary: { main: "#2a48f3" },
    mode: "dark",
  },
});

const globalStyles = css`
  :root {
    body {
      background-color: #fff;
      color: #121212;
    }
  }

  [data-theme="dark"] {
    body {
      background-color: #121212;
      color: #fff;
    }
  }
`;
const theme = extendTheme({ cssVarPrefix: "demo" });

export default function MyApp({ Component, pageProps }: AppProps) {
  const emotionCache = createCache({ key: "css", prepend: true });

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      {/* <ThemeProvider theme={currentTheme}> */}
      <CssVarsProvider
        defaultMode="dark"
        colorSchemeSelector="#demo_dark-mode-by-default"
        modeStorageKey="demo_dark-mode-by-default"
        disableNestedContext
      >
        <CssBaseline />
        <GlobalStyles styles={globalStyles} />
        <Component {...pageProps} />
      </CssVarsProvider>
      {/* </ThemeProvider> */}
    </CacheProvider>
  );
}
