import { AccountCircle, Source } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Dropdown,
  IconButton,
  ListItemDecorator,
  Menu,
  MenuButton,
  MenuItem,
  Stack,
} from "@mui/joy";
import { AppBar, Typography } from "@mui/material";
import logo from "assets/logo.png";
import Link from "next/link";

import ModeToggle from "./ModeToggle";
import SearchBar from "./SearchBar";

export default function _AppBar() {
  // TODO:
  const authed = true;
  const avatar = <Avatar size="sm" />;
  const username = "Ecolsson";

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
        py: 1,
      }}
    >
      <Stack
        direction="row"
        px={2}
        maxWidth={1000}
        width="100%"
        display="flex"
        alignContent="center"
        alignItems="center"
        justifyContent="space-between"
        justifyItems="center"
        flexWrap="wrap"
      >
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
        <SearchBar
          sx={{
            alignSelf: "center",
            justifySelf: "center",
            mx: { mobile: 0, tablet: 6 },
            pt: { mobile: 1, tablet: 0 },
            flexGrow: 1,
            order: { mobile: 3, tablet: 0 },
            minWidth: { mobile: 300, tablet: 0 },
          }}
        ></SearchBar>
        <ModeToggle />
        {authed && (
          <Box sx={{ ml: 2 }}>
            <Dropdown>
              <MenuButton
                slots={{ root: IconButton }}
                slotProps={{ root: { style: { backgroundColor: "#00000000" } } }}
                sx={{ backgroundColor: "#00000000" }}
              >
                {avatar}
              </MenuButton>
              <Menu placement="bottom">
                <MenuItem>
                  <ListItemDecorator>
                    <AccountCircle />
                  </ListItemDecorator>
                  <Link
                    href={`/users/${username}`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      outline: 0,
                      cursor: "pointer",
                    }}
                  >
                    Account
                  </Link>
                </MenuItem>
                <MenuItem>
                  <ListItemDecorator>
                    <Source />
                  </ListItemDecorator>
                  Modules
                </MenuItem>
              </Menu>
            </Dropdown>
          </Box>
        )}
      </Stack>
    </AppBar>
  );
}
