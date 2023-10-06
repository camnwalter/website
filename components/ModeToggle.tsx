import { DarkMode, LightMode } from "@mui/icons-material";
import { IconButton } from "@mui/joy";
import { useColorScheme as useJoyColorScheme } from "@mui/joy/styles";
import { useColorScheme as useMaterialColorScheme } from "@mui/material/styles";
import { useEffect, useState } from "react";

export default function ModeToggle() {
  const { mode, setMode: setMaterialMode } = useMaterialColorScheme();
  const { setMode: setJoyMode } = useJoyColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // prevent server-side rendering mismatch
    // because `mode` is undefined on the server.
    return null;
  }

  return (
    <IconButton
      onClick={() => {
        setMaterialMode(mode === "dark" ? "light" : "dark");
        setJoyMode(mode === "dark" ? "light" : "dark");
      }}
    >
      {/** You can use `mode` from Joy UI or Material UI since they are synced **/}
      {mode === "dark" ? <DarkMode /> : <LightMode htmlColor="rgb(205, 215, 225)" />}
    </IconButton>
  );
}
