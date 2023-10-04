import { Box, Stack } from "@mui/joy";
import { AppBar, Typography } from "@mui/material";
import logo from "assets/logo.svg";

export default function _AppBar() {
  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#5b21b6",
        display: "flex",
        width: "100%",
        flexDirection: "row",
        alignContent: "center",
        alignItems: "center",
        justifyItems: "center",
        justifyContent: "center",
      }}
    >
      <Stack
        mx={{ xs: 1, md: 5 }}
        width="100%"
        height={48}
        maxWidth={1000}
        direction="row"
        alignContent="center"
        alignItems="center"
      >
        <Box mr={4} height="80%">
          <img src={logo.src} alt="chattriggers logo" height="100%" />
        </Box>
        <Typography variant="h5">ChatTriggers</Typography>
      </Stack>
    </AppBar>
  );
}
