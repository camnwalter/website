import { useColorScheme, useTheme } from "@mui/joy";
import { useMediaQuery } from "@mui/material";
import { Breakpoint } from "@mui/system";
import { SystemMode } from "@mui/system/cssVars/useCurrentColorScheme";

export function useBreakpoint(value: Breakpoint): boolean {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up(value));
}

export function useMode(): SystemMode {
  const { mode: currMode, systemMode } = useColorScheme();
  return (currMode === "system" ? systemMode : currMode) ?? "dark";
}
