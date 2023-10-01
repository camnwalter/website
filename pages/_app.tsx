import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { CssBaseline, CssVarsProvider } from "@mui/joy";
import type { AppProps } from "next/app";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CssVarsProvider defaultMode="dark">
      <CssBaseline />
      <Component {...pageProps} />
    </CssVarsProvider>
  );
}
