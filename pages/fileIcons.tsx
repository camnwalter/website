import { Box } from "@mui/joy";
import javascript from "components/icons/javascript.svg";
import json from "components/icons/json.svg";
import markdown from "components/icons/markdown.svg";
import text from "components/icons/text.svg";
import typescript from "components/icons/typescript.svg";

const EXT_TO_LANG_MAP: Record<string, string> = {
  tsx: "typescript",
  ts: "typescript",
  jsx: "javascript",
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  json: "json",
  md: "markdown",
};

// https://github.com/vscode-icons/vscode-icons/tree/master/icons
const LANG_TO_SVG_MAP: Record<string, typeof text> = {
  javascript,
  json,
  markdown,
  text,
  typescript,
};

export const getLanguage = (path: string) => {
  const lastDot = path.lastIndexOf(".");
  if (lastDot <= 0) return "text";
  return EXT_TO_LANG_MAP[path.substring(lastDot + 1)] ?? "text";
};

interface FileIconProps {
  path: string;
}

export default function FileIcon({ path }: FileIconProps) {
  return <img height="14px" src={LANG_TO_SVG_MAP[getLanguage(path)].src} />;
}
