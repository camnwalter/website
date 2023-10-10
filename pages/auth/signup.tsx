import {
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Sheet,
  Typography,
} from "@mui/joy";
import { USERNAME_REGEX } from "components/auth";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { useState } from "react";
import { useMode } from "utils/layout";
import validator from "validator";

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

function ProviderButton(props: React.ComponentProps<typeof Button>) {
  return (
    <Button
      {...props}
      sx={{ my: 2, width: "100%", backgroundColor: theme => theme.vars.palette.secondary[400] }}
      type="submit"
    />
  );
}

export default function SignIn({ error }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const errorMessage = error ? errorMessages[error] ?? errorMessages.Default : undefined;

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usernameChanged, setUsernameChanged] = useState(false);
  const [emailChanged, setEmailChanged] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  const usernameValid = USERNAME_REGEX.test(username);
  const emailValid = validator.isEmail(email);
  const passwordValid = password.length >= 8;

  const onChangeHandler =
    (valueSetter: (value: string) => void, valueChangedSetter: (value: boolean) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      valueSetter(e.target.value);
      valueChangedSetter(true);
    };

  const onEmailSignUp = async () => {
    const result = await signIn("credentials", {
      username: email,
      password,
      signup: true,
      redirect: false,
    });
    console.log(result);
  };

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
          <Typography level="h3">Sign Up</Typography>
        </Box>
        <FormControl sx={{ mb: 2 }}>
          <FormLabel>Username</FormLabel>
          <Input
            value={username}
            onChange={onChangeHandler(setUsername, setUsernameChanged)}
            error={usernameChanged && !usernameValid}
          />
          <FormHelperText sx={{ display: usernameChanged && !usernameValid ? undefined : "none" }}>
            Username must be between 3 and 24 character, and can only container letters, numbers,
            and underscores
          </FormHelperText>
        </FormControl>
        <FormControl sx={{ mb: 2 }}>
          <FormLabel>Email</FormLabel>
          <Input
            value={email}
            onChange={onChangeHandler(setEmail, setEmailChanged)}
            error={emailChanged && !emailValid}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={onChangeHandler(setPassword, setPasswordChanged)}
            error={passwordChanged && !passwordValid}
          />

          <FormHelperText sx={{ display: passwordChanged && !passwordValid ? undefined : "none" }}>
            Password must be at least 8 characters long
          </FormHelperText>
        </FormControl>
        <ProviderButton
          onClick={onEmailSignUp}
          disabled={!usernameValid || !emailValid || !passwordValid}
        >
          Sign up
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

  return { props: { error: (ctx.query.error as string | undefined) ?? null } };
}
