import { styled } from "@mui/joy";
import { switchMode } from "app/(utils)/layout";
import dynamic from "next/dynamic";
import rehypeSanitize from "rehype-sanitize";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const StyledMDEditor = styled(MDEditor)(({ theme }) => ({
  ".w-md-editor-content, .w-md-editor-toolbar, .wmde-markdown, .wmde-markdown-color ": {
    backgroundColor: theme.vars.palette.neutral[switchMode(900, 100)],
  },
}));

interface Props {
  value?: string;
  setValue(value?: string): void;
}

export default function MarkdownEditor({ value, setValue }: Props) {
  return (
    <StyledMDEditor
      value={value}
      onChange={setValue}
      previewOptions={{
        rehypePlugins: [[rehypeSanitize]],
      }}
    />
  );
}
