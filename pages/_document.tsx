import { getInitColorSchemeScript } from "@mui/joy/styles";
import Document, { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html data-color-scheme="light">
      <Head>...</Head>
      <body>
        {getInitColorSchemeScript()}
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
