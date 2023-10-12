"use client";

import { Box, FormControl, FormHelperText, FormLabel, Input, Sheet, Typography } from "@mui/joy";
import { USERNAME_REGEX } from "app/users/[user]/UserComponent";
import { useRouter } from "next/navigation";
import { useState } from "react";
import validator from "validator";

import ProviderButton from "../ProviderButton";

export default function SignIn() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usernameChanged, setUsernameChanged] = useState(false);
  const [emailChanged, setEmailChanged] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [error, setError] = useState<string | undefined>();

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
    const response = await fetch("/api/account/login", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });

    if (response.ok) {
      router.push("/modules");
      // AppBar doesn't update without this refresh call
      router.refresh();
      return;
    }

    const body = (await response.body?.getReader?.()?.read?.())?.value;
    if (body) {
      setError(new TextDecoder().decode(body));
    } else {
      setError("Unknown error occurred");
    }
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
            onKeyDown={e => (e.key === "Enter" ? onEmailSignUp() : undefined)}
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
            onKeyDown={e => (e.key === "Enter" ? onEmailSignUp() : undefined)}
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
      {error && (
        <Sheet variant="solid" color="danger" sx={{ mt: 5, px: 5, py: 1, borderRadius: 10 }}>
          <Typography>{error}</Typography>
        </Sheet>
      )}
    </Box>
  );
}
