"use client";

import { FilterList, QuestionMark } from "@mui/icons-material";
import { Autocomplete, Box, Chip, ChipDelete, Dropdown, IconButton, Input, Menu, MenuButton, MenuItem, Stack, Tooltip, Typography } from "@mui/joy";
import type { SxProps, Theme } from "@mui/material/styles";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { switchMode } from "utils/layout";

interface Props {
  sx?: SxProps<Theme>;
}

export default function SearchBar({ sx = [] }: Props) {
  const router = useRouter();
  const query = useSearchParams();

  const [searchKind, setSearchKind] = useState('Name');
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === "Enter") handleSubmit();
  };

  const handleSubmit = (): void => {
    const queryParams = new URLSearchParams();
    queryParams.set(searchKind.toLowerCase(), inputValue);
    router.push(`/modules?${queryParams}`);
  };

  const createMenuItem = (kind: string) => (
    <MenuItem selected={searchKind === kind} onClick={() => setSearchKind(kind)}>
      <Typography>{kind}</Typography>
    </MenuItem>
  )

  return (
    <Box sx={[...(Array.isArray(sx) ? sx : [sx]), { width: { mobile: "100%", tablet: "auto" } }]}>
      <Input
        placeholder="Search"
        endDecorator={(
          <Dropdown>
            <MenuButton>Searching: {searchKind}</MenuButton>
            <Menu>
              {createMenuItem('Name')}
              {createMenuItem('Description')}
              {createMenuItem('Summary')}
              {createMenuItem('Owner')}
              {createMenuItem('Tag')}
            </Menu>
          </Dropdown>
        )}
        onKeyDown={handleKeyDown}
        value={inputValue ?? undefined}
        onChange={e => setInputValue(e.target.value)}
        sx={theme => ({
          "--Input-radius": "43px",
          "--Input-focusedInset": "var(--any, )",
          "--Input-focusedThickness": "4px",
          "&:focus-within::before": {
            boxShadow: `0px 0px 0px 4px ${theme.vars.palette.secondary[600]}`,
          },
          "&::before": {
            transition: "box-shadow .15s ease-in-out",
            p: 0,
            m: 0,
          },
          minHeight: 32,
          backgroundColor: theme.vars.palette.neutral[switchMode(700, 100)],
          border: "none",
          boxShadow: "none",
        })}
      />
    </Box>
  );
}
