import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { CssBaseline } from "@mui/joy";
import type { AppProps } from "next/app";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* For some reason, omitting disableColorScheme and surrounding this with CssVarsProvider
          breaks TreeView from mui-x, so we just disable the color scheme and live with it */}
      <CssBaseline disableColorScheme />
      <Component {...pageProps} />
    </>
  );
}
