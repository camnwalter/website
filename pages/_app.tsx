import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "reflect-metadata";

import { Box, CssBaseline, CssVarsProvider as JoyCssVarsProvider } from "@mui/joy";
import {
  Experimental_CssVarsProvider as MaterialCssVarsProvider,
  THEME_ID as MATERIAL_THEME_ID,
} from "@mui/material/styles";
import AppBar from "components/AppBar";
import type { AppProps } from "next/app";
import { joyTheme, materialTheme } from "styles/theme";
import * as api from "utils/api";
import { AuthenticatedUser } from "utils/db/entities";

interface Props extends AppProps {
  user?: AuthenticatedUser;
}

export default function MyApp({ Component, pageProps, user }: Props) {
  return (
    <MaterialCssVarsProvider defaultMode="dark" theme={{ [MATERIAL_THEME_ID]: materialTheme }}>
      <JoyCssVarsProvider defaultMode="dark" theme={joyTheme}>
        <CssBaseline />
        <AppBar user={user} />
        <Box display="flex" justifyContent="center">
          <Box maxWidth={1000} width="100%" p={2}>
            <Component {...pageProps} />
          </Box>
        </Box>
      </JoyCssVarsProvider>
    </MaterialCssVarsProvider>
  );
}

export const getInitialProps = () => {
  console.log("get initial prosp");
  return {};
};

export const getServerSideProps = api.withSessionSsr(ctx => {
  console.log("session: ", ctx.req.session);
  return {
    props: { user: ctx.req.session.user },
  };
});
