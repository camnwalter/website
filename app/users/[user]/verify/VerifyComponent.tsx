"use client";

import { Box, Sheet, Typography } from "@mui/joy";

// This is only ever rendered if the verification succeeded, so it doesn't
// need any error checking or anything
export default function VerifyComponent() {
  return (
    <Box
      width="100%"
      mt={5}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      justifyItems="center"
      alignItems="center"
      alignContent="center"
    >
      <Sheet
        variant="soft"
        sx={{
          width: "100%",
          maxWidth: 500,
          borderRadius: 10,
          p: 3,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Typography level="h3">Thank you for verifying your email!</Typography>
      </Sheet>
    </Box>
  );
}
