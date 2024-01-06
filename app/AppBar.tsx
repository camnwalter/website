"use client";

import { AccountCircle, AddBox, Logout, PriorityHigh } from "@mui/icons-material";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Dropdown,
  IconButton,
  ListItemDecorator,
  Menu,
  MenuButton,
  MenuItem,
  Modal,
  ModalClose,
  ModalDialog,
  Sheet,
  Stack,
} from "@mui/joy";
import { AppBar, Typography } from "@mui/material";
import type { AuthenticatedUser } from "app/api/db";
import Link from "next/link";
import logo from "public/logo.png";
import React, { useState } from "react";

import ModeToggle from "./ModeToggle";
import SearchBar from "./SearchBar";

interface Props {
  user?: AuthenticatedUser;
}

export default function _AppBar({ user }: Props) {
  let avatar: React.ReactNode | undefined;
  if (user) {
    avatar = (
      <Avatar
        size="sm"
        src={user.image ? `${process.env.NEXT_PUBLIC_WEB_ROOT}/${user.image}` : undefined}
      />
    );

    // Unread badge takes precedent over notification badge
    if (!user.email_verified) {
      avatar = (
        <Badge badgeContent="❕" color="danger" size="sm">
          {avatar}
        </Badge>
      );
    } else {
      const unreadNotifications = user.notifications.filter(n => !n.read).length;
      if (unreadNotifications > 0) {
        avatar = (
          <Badge badgeContent={unreadNotifications} color="secondary">
            {avatar}
          </Badge>
        );
      }
    }
  }

  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [verificationModalLoading, setVerificationModalLoading] = useState(false);

  const onSendVerificationEmail = async () => {
    setVerificationModalLoading(true);

    const formData = new FormData();
    formData.set("email", user!.email);

    await fetch("/api/account/verify/send", {
      method: "POST",
      body: formData,
    });

    setVerificationModalOpen(false);
    setVerificationModalLoading(false);
  };

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
            <Typography variant="h5" sx={{ ml: 2, display: { mobile: "none", tablet: "initial" } }}>
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
        />
        {user?.email_verified && (
          <Link
            href="/modules/create"
            style={{
              textDecoration: "none",
              color: "inherit",
              outline: 0,
              cursor: "pointer",
            }}
          >
            <IconButton sx={{ mr: 1 }}>
              <AddBox />
            </IconButton>
          </Link>
        )}
        <ModeToggle />
        {user ? (
          <Box sx={{ ml: 1 }}>
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
                    href={`/users/${user.name}`}
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
                {!user.email_verified && (
                  <MenuItem onClick={() => setVerificationModalOpen(true)}>
                    <ListItemDecorator>
                      <PriorityHigh color="error" />
                    </ListItemDecorator>
                    Email Not Verified
                  </MenuItem>
                )}
                <Divider />
                <MenuItem>
                  <ListItemDecorator>
                    <Logout />
                  </ListItemDecorator>
                  <Link
                    href="/auth/signout"
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      outline: 0,
                      cursor: "pointer",
                    }}
                  >
                    Logout
                  </Link>
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
      <Modal open={verificationModalOpen} onClose={() => setVerificationModalOpen(false)}>
        <ModalDialog>
          <ModalClose variant="plain" sx={{ m: 1 }} />
          <Typography id="modal-title">Send verification email?</Typography>
          <Box
            sx={{
              mt: 1,
              display: "flex",
              gap: 1,
              flexDirection: { xs: "column", sm: "row-reverse" },
            }}
          >
            <Button
              variant="solid"
              color="primary"
              loading={verificationModalLoading}
              onClick={onSendVerificationEmail}
            >
              Send
            </Button>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => setVerificationModalOpen(false)}
            >
              Cancel
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </AppBar>
  );
}
