import { GitHub } from "@mui/icons-material";
import { Box, Button, Divider, FormControl, FormLabel, Input, Sheet, Typography } from "@mui/joy";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getServerSession } from "next-auth";
import { getCsrfToken, getProviders, signIn } from "next-auth/react";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { useState } from "react";
import { useMode } from "utils/layout";

// Error names from https://next-auth.js.org/configuration/pages
const errorMessages: Record<string, string> = {
  OAuthSignin: "Error while constructing OAuth authorization URL",
  OAuthCallback: "Error while handling OAuth response",
  OAuthCreateAccount: "Failed to create OAuth user",
  EmailCreateAccount: "Failed to create email user",
  Callback: "Error while handling OAuth callback",
  OAuthAccountNotLinked: "OAuth account is already linked with a different email",
  EmailSignin: "Failed to send verification email",
  CredentialsSignin: "Invalid credentials",
  SessionRequired: "Page requires sign in",
  Default: "Unknown error occurred",
};

function ProviderDivider() {
  const mode = useMode();
  const divider = (
    <Divider
      sx={{
        flexGrow: 2,
        alignSelf: "center",
        backgroundColor: theme =>
          mode === "dark" ? theme.vars.palette.neutral[700] : theme.vars.palette.neutral[300],
      }}
    />
  );

  return (
    <Box display="flex" flexDirection="row">
      {divider}
      <Typography mx={2}>or</Typography>
      {divider}
    </Box>
  );
}

function ProviderButton(props: React.ComponentProps<typeof Button>) {
  return (
    <Button
      {...props}
      sx={{ my: 2, width: "100%", backgroundColor: theme => theme.vars.palette.secondary[400] }}
      type="submit"
    />
  );
}

export default function SignIn({
  providers,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { github: githubProvider } = providers;

  const errorMessage = error ? errorMessages[error] ?? errorMessages.Default : undefined;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onEmailSignIn = () => {
    signIn("credentials", {
      username: email,
      password,
    });

    // const data = new FormData();
    // data.append("csrfToken", csrfToken);
    // data.append("username", email);
    // data.append("password", password);
    // await fetch("/api/auth/callback/credentials", {
    //   method: "POST",
    // });
  };

  const onGithubSignin = () => {};

  return (
    <Box
      width="100%"
      mt={10}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      justifyItems="center"
      alignItems="center"
      alignContent="center"
    >
      <Sheet variant="soft" sx={{ width: "100%", maxWidth: 400, borderRadius: 10, p: 3 }}>
        <Box mb={2} width="100%" display="flex" justifyContent="center">
          <Typography level="h3">Log In</Typography>
        </Box>
        <FormControl sx={{ mb: 2 }}>
          <FormLabel>Username or Email</FormLabel>
          <Input value={email} onChange={e => setEmail(e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Password</FormLabel>
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </FormControl>
        <ProviderButton onClick={onEmailSignIn}>Log in with Credentials</ProviderButton>
        <ProviderDivider />
        <ProviderButton id="github" startDecorator={<GitHub />}>
          Log in with GitHub
        </ProviderButton>
      </Sheet>
      {errorMessage && (
        <Sheet variant="solid" color="danger" sx={{ mt: 5, px: 5, py: 1, borderRadius: 10 }}>
          <Typography>{errorMessage}</Typography>
        </Sheet>
      )}
    </Box>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return { redirect: { destination: "/modules" } };
  }

  const providers = await getProviders();
  if (!providers) throw new Error("Failed to get providers");

  return { props: { providers, error: (ctx.query.error as string | undefined) ?? null } };
}
