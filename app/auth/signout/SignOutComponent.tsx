"use client";

import { Box, Button, Sheet, Typography } from "@mui/joy";
import colors from "@mui/joy/colors";
import { useRouter } from "next/navigation";
import { switchMode, useMode } from "utils/layout";

export default function SignOutComponent() {
  const router = useRouter();
  const mode = useMode();

  const handleSignOut = async () => {
    await fetch("/api/account/logout", { method: "POST" });
    // AppBar doesn't update without this refresh call
    router.back();
    router.refresh();
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
          <Typography level="h3">Sign Out</Typography>
        </Box>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
            mt: 3,
            mb: 3,
          }}
        >
          <Typography>Are you sure?</Typography>
        </Box>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
          }}
        >
          <Button
            sx={{
              mr: 2,
              width: "100%",
              color: colors.grey[switchMode(100, 800, mode)],
              backgroundColor: colors.green[switchMode(700, 400, mode)],
            }}
            onClick={() => router.back()}
          >
            No, take me back
          </Button>
          <Button
            sx={{
              ml: 2,
              width: "100%",
              color: colors.grey[switchMode(100, 800, mode)],
              backgroundColor: colors.red[switchMode(700, 400, mode)],
            }}
            onClick={handleSignOut}
          >
            Yes, sign me out
          </Button>
        </Box>
      </Sheet>
    </Box>
  );
}
