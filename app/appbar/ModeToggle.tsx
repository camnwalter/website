"use client";

import { DarkMode, LightMode } from "@mui/icons-material";
import { IconButton } from "@mui/joy";
import { useColorScheme as useJoyColorScheme } from "@mui/joy/styles";
import { useColorScheme as useMaterialColorScheme } from "@mui/material/styles";
import { useEffect, useState } from "react";

// Note: The data-color-mode attribute setting is for the Markdown editor
export default function ModeToggle() {
  const { mode, setMode: setMaterialMode } = useMaterialColorScheme();
  const { setMode: setJoyMode } = useJoyColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.setAttribute("data-color-mode", mode ?? "dark");
  }, [mode]);

  if (!mounted) {
    // prevent server-side rendering mismatch
    // because `mode` is undefined on the server.
    return null;
  }

  return (
    <IconButton
      onClick={() => {
        const newMode = mode === "dark" ? "light" : "dark";
        setMaterialMode(newMode);
        setJoyMode(newMode);
        document.documentElement.setAttribute("data-color-mode", newMode);
      }}
    >
      {/** You can use `mode` from Joy UI or Material UI since they are synced **/}
      {mode === "dark" ? <DarkMode /> : <LightMode htmlColor="rgb(205, 215, 225)" />}
    </IconButton>
  );
}
