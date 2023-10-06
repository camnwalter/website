import { Box, Grid } from "@mui/joy";
import { AppBar, Typography } from "@mui/material";
import logo from "assets/logo.png";
import Link from "next/link";

import ModeToggle from "./ModeToggle";

export default function _AppBar() {
  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#7e57c2",
        display: "flex",
        width: "100%",
        flexDirection: "row",
        alignContent: "center",
        alignItems: "center",
        justifyItems: "center",
        justifyContent: "center",
      }}
    >
      <Grid
        container
        height={48}
        px={2}
        maxWidth={1000}
        width="100%"
        alignContent="center"
        alignItems="center"
      >
        <Grid xs={3}>
          <Link
            href="/modules"
            style={{ textDecoration: "none", color: "inherit", outline: 0, cursor: "pointer" }}
          >
            <Box
              height={40}
              display="flex"
              flexDirection="row"
              alignContent="center"
              alignItems="center"
            >
              <img src={logo.src} alt="chattriggers logo" height="100%" />
              <Typography ml={2} variant="h5">
                ChatTriggers
              </Typography>
            </Box>
          </Link>
        </Grid>
        <Grid xs={8}></Grid>
        <Grid xs={1} display="flex" justifyContent="end">
          <ModeToggle />
        </Grid>
      </Grid>
    </AppBar>
  );
}
