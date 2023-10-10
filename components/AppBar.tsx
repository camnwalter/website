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
  Sheet,
  Stack,
} from "@mui/joy";
import { AppBar, Typography } from "@mui/material";
import logo from "assets/logo.png";
import Link from "next/link";
import { useSession } from "next-auth/react";

import ModeToggle from "./ModeToggle";
import SearchBar from "./SearchBar";

export default function _AppBar() {
  const { data } = useSession();

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
        {data ? (
          <Box sx={{ ml: 2 }}>
            <Dropdown>
              <MenuButton
                slots={{ root: IconButton }}
                slotProps={{ root: { style: { backgroundColor: "#00000000" } } }}
                sx={{ backgroundColor: "#00000000" }}
              >
                <Avatar size="sm" src={data.user?.image ?? undefined} />
              </MenuButton>
              <Menu placement="bottom">
                <MenuItem>
                  <ListItemDecorator>
                    <AccountCircle />
                  </ListItemDecorator>
                  <Link
                    href={`/users/${data.user?.name}`}
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
        ) : (
          <Sheet
            variant="soft"
            sx={{
              px: 3,
              py: 0.5,
              ml: 2,
              borderRadius: 5,
              backgroundColor: theme => theme.vars.palette.primary[400],
            }}
          >
            <Link
              href={`/auth/signin`}
              style={{
                textDecoration: "none",
                color: "inherit",
                outline: 0,
                cursor: "pointer",
              }}
            >
              <Typography sx={{ color: "white" }}>Log In or Sign Up</Typography>
            </Link>
          </Sheet>
        )}
      </Stack>
    </AppBar>
  );
}
