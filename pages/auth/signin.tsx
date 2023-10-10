import { Box, Button, FormControl, FormLabel, Input, Sheet, Typography } from "@mui/joy";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { useState } from "react";

function ProviderButton(props: React.ComponentProps<typeof Button>) {
  return (
    <Button
      {...props}
      sx={{ my: 2, width: "100%", backgroundColor: theme => theme.vars.palette.secondary[400] }}
      type="submit"
    />
  );
}

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const router = useRouter();

  const onEmailSignIn = async () => {
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.ok) {
      return router.push("/modules");
    }

    setError(result?.error ?? "Unknown error occurred");
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
        <ProviderButton onClick={onEmailSignIn}>Sign in</ProviderButton>
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

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return { redirect: { destination: "/modules" } };
  }

  return { props: {} };
}
