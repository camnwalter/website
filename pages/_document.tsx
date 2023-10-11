import { getInitColorSchemeScript } from "@mui/joy/styles";
import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head></Head>
      <body>
        {getInitColorSchemeScript()}
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

export const getInitialProps = () => {
  console.log("get initial prosp");
  return {};
};

export const getServerSideProps = ctx => {
  console.log("get ssr");
  return {
    props: {},
  };
};
