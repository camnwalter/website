"use client";

import { QuestionMark } from "@mui/icons-material";
import { Box, Chip, ChipDelete, IconButton, Input, Stack, Tooltip, Typography } from "@mui/joy";
import type { SxProps, Theme } from "@mui/material/styles";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { switchMode } from "utils/layout";

const helpText = (
  <Typography level="body-sm" sx={{ color: "#ddd" }}>
    Searches module names, descriptions, and authors. Use <br />
    <code style={{ backgroundColor: "#555" }}>name:&lt;value&gt;</code> to filter by name,{" "}
    <code style={{ backgroundColor: "#555" }}>author:&lt;value&gt;</code>
    <br />
    to filter for author, and <code style={{ backgroundColor: "#555" }}>tag:&lt;value&gt;</code> to
    filter by tags.
  </Typography>
);

const chipOptions = ["name", "owner", "description", "tag"].map(tag => {
  return [tag, new RegExp(`(?:^| )(?<tag>${tag}:\\w+) `)] as const;
});

function getChips(input: string): { chips: string[]; searchValue: string } {
  const chips = [];
  let searchValue = input;

  for (const option of chipOptions) {
    const match = option[1].exec(searchValue);
    if (!match) continue;

    chips.push(match[1]);

    const firstIndex = searchValue.indexOf(match[0]);
    const lastIndex = match.index + match[0].length;
    searchValue = searchValue.substring(0, firstIndex) + searchValue.substring(lastIndex);
  }

  return { chips, searchValue };
}

interface Props {
  sx?: SxProps<Theme>;
}

export default function SearchBar({ sx = [] }: Props) {
  const makeChip = (text: string) => ({
    value: text,
    node: (
      <Chip
        key={text}
        variant="solid"
        endDecorator={
          <ChipDelete sx={{ ml: 0 }} variant="outlined" onDelete={() => handleDeleteChip(text)} />
        }
      >
        {text}
      </Chip>
    ),
  });

  const router = useRouter();
  const query = useSearchParams();

  const [value, setValue] = useState("");
  const [chips, setChips] = useState<{ value: string; node: React.ReactNode }[]>([]);

  useEffect(() => {
    const initialChips = Object.entries(query)
      .filter(([name]) => chipOptions.find(o => o[0] === name))
      .map(([name, value]) => `${name}:${value}`);
    const q = query.get("q");
    const initialValue = (Array.isArray(q) ? q.at(-1) : q) ?? "";

    setValue(initialValue);
    setChips(initialChips.map(makeChip));
  }, [query]);

  const handleDeleteChip = (text: string): void => {
    setChips(chips.filter(c => c.value !== text));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    const { chips: newChips, searchValue } = getChips(value);
    if (newChips.length) {
      setChips([...chips, ...newChips.map(makeChip)]);
    }
    setValue(searchValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === "Enter") handleSubmit();
  };

  const handleSubmit = (): void => {
    const queryParams = new URLSearchParams();
    for (const chip of chips) {
      const [name, value] = chip.value.split(":");
      queryParams.set(name, value.trim());
    }

    if (value.split("").some(c => c !== " ")) {
      queryParams.set("q", value);
    }

    router.replace(`/modules?${queryParams}`);
  };

  const renderedChips = (
    <Stack direction="row" spacing={1}>
      {chips.map(c => c.node)}
    </Stack>
  );

  return (
    <Box sx={[...(Array.isArray(sx) ? sx : [sx]), { width: { mobile: "100%", tablet: "auto" } }]}>
      <Input
        placeholder="Search"
        startDecorator={renderedChips}
        endDecorator={
          <Tooltip title={helpText} arrow>
            <IconButton sx={{ mr: 0 /* this gives it more margin for some reason? */ }}>
              <QuestionMark />
            </IconButton>
          </Tooltip>
        }
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
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
