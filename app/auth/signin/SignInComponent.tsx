"use client";

import { Box, FormControl, FormLabel, Input, Sheet, Typography } from "@mui/joy";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import ProviderButton from "../ProviderButton";

export default function SignInComponent() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();

  const onSignIn = async () => {
    const response = await fetch("/api/account/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) return router.push("/modules");

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
          <Typography level="h3">Log In</Typography>
        </Box>
        <FormControl sx={{ mb: 2 }}>
          <FormLabel>Username or Email</FormLabel>
          <Input value={username} onChange={e => setUsername(e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Password</FormLabel>
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </FormControl>
        <ProviderButton onClick={onSignIn}>Sign in</ProviderButton>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
          }}
        >
          <Typography>
            No account?{" "}
            <Link href="/auth/signup" style={{ textDecoration: "none" }}>
              Sign up
            </Link>
          </Typography>
        </Box>
      </Sheet>
      {error && (
        <Sheet variant="solid" color="danger" sx={{ mt: 5, px: 5, py: 1, borderRadius: 10 }}>
          <Typography>{error}</Typography>
        </Sheet>
      )}
    </Box>
  );
}
