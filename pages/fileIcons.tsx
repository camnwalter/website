import { useEffect, useState } from "react";
import InlineSVG from "react-inlinesvg";

const ICONS: Record<string, string> = {
  tsx: "typescript",
  ts: "typescript",
  jsx: "javascript",
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  json: "json",
  md: "markdown",
};

export const getLanguage = (path: string) => {
  const lastDot = path.lastIndexOf(".");
  if (lastDot <= 0) return "plaintext";
  return ICONS[path.substring(lastDot + 1)] ?? "plaintext";
};

const iconUrl = (name: string) => `https://raw.githubusercontent.com/jesseweed/seti-ui/master/icons/${name}.svg`;

interface FileIconProps {
  language: string;
}

export default function FileIcon({ language }: FileIconProps) {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    async function getSvg() {
      const base64 = await fetch(iconUrl(language === "plaintext" ? "default " : language))
        .then(r => r.blob())
        .then(
          blob =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onerror = reject;
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            }),
        );

      setSvg(base64 as string);
    }

    if (!svg) getSvg();
  }, []);

  return svg ? <InlineSVG src={svg} width={20} height={20} /> : null;
}
