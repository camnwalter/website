import Editor, { useMonaco } from "@monaco-editor/react";
import { ChevronRight, Close } from "@mui/icons-material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, Divider, Stack, Typography } from "@mui/joy";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { TreeView } from "@mui/x-tree-view/TreeView";
import * as monaco from "monaco-editor";
import { useEffect, useState } from "react";
import * as React from "react";
import SVG from "react-inlinesvg";
import { getIcon } from "seti-icons";

import FileIcon, { getLanguage } from "./fileIcons";

const HIGHLIGHT_COLOR = "#282C34";
const NORMAL_COLOR = "#21252B";
const TEXT_COLOR = "#cccccc";

interface TabListProps {
  paths: string[];
  selectedPath: string;
  onChange(tab: string): void;
}

function TabList({ paths, selectedPath, onChange }: TabListProps) {
  const parts = selectedPath.split("/");
  const partComponents = parts.map((part, idx) => (
    <React.Fragment key={part}>
      <Typography textColor={TEXT_COLOR} level="body-sm" alignSelf="center">
        {part}
      </Typography>
      {idx !== parts.length - 1 && <ChevronRight />}
    </React.Fragment>
  ));

  return (
    <Box sx={{ backgroundColor: NORMAL_COLOR }}>
      <Box display="flex">
        {paths.map(path => {
          const lastSeparator = path.lastIndexOf("/");
          const name = lastSeparator === -1 ? path : path.substring(lastSeparator + 1);
          const language = getLanguage(name);

          return (
            <Box
              key={path}
              display="flex"
              padding={1}
              onClick={() => onChange(path)}
              sx={{
                backgroundColor: selectedPath === path ? HIGHLIGHT_COLOR : NORMAL_COLOR,
                borderRight: "1px solid #111111",
              }}
            >
              <FileIcon language={language} />
              <Typography textColor={TEXT_COLOR} px={1} level="body-sm" alignSelf="center">
                {name}
              </Typography>
              <Close />
            </Box>
          );
        })}
      </Box>
      <Box
        display="flex"
        alignItems="center"
        sx={{ backgroundColor: HIGHLIGHT_COLOR, height: 20, pl: 1, pb: "4px" }}
      >
        {partComponents}
      </Box>
    </Box>
  );
}

interface Node {
  id: number;
  name: string;
  children?: Record<string, Node>;
}

function convertFilesToTreeList(paths: string[]) {
  const root: Node = { id: 0, name: "__root" };
  let nextId = 1;

  for (const path of paths) {
    const parts = path.split("/");
    let node = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!node.children) node.children = {};

      if (!node.children[part]) node.children[part] = { id: nextId++, name: part };
      node = node.children[part]!;
    }
  }

  console.log(JSON.stringify(root, null, 2));

  function nodeToTreeList(node: Node) {
    console.log(`node: ${node.id}`);
    if (!node.children)
      return <TreeItem key={node.id} nodeId={node.id.toString()} label={node.name} />;

    return (
      <TreeItem key={node.id} nodeId={node.id.toString()} label={node.name}>
        {Object.values(node.children).map(nodeToTreeList)}
      </TreeItem>
    );
  }

  return <TreeView>{Object.values(root.children!).map(nodeToTreeList)}</TreeView>;
}

interface TreeListProps {
  files: Record<string, string>;
}

function TreeList({ files }: TreeListProps) {
  return (
    <TreeView
      aria-label="file system navigator"
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      sx={{ height: 240, flexGrow: 1, maxWidth: 400, overflowY: "auto" }}
    >
      <TreeItem nodeId="1" label="Applications">
        <TreeItem nodeId="2" label="Calendar" />
      </TreeItem>
      <TreeItem nodeId="5" label="Documents">
        <TreeItem nodeId="10" label="OSS" />
        <TreeItem nodeId="6" label="MUI">
          <TreeItem nodeId="8" label="index.js" />
        </TreeItem>
      </TreeItem>
    </TreeView>
  );
  // return convertFilesToTreeList(Object.keys(files));
}

interface CustomEditorProps {
  projectName?: string;
  files: Record<string, string>;
}

function CustomEditor({ files }: CustomEditorProps) {
  const [selectedPath, setSelectedPath] = useState<string>(Object.keys(files)[0]);
  const language = getLanguage(selectedPath);

  function onClickTab(path: string) {
    setSelectedPath(path);
  }

  return (
    <Box display="flex" flexDirection="row" sx={{ width: "100%", height: "100%" }}>
      <Box sx={{ width: "300px", height: "100%", backgroundColor: "red" }}>
        <TreeList files={files} />
      </Box>
      <Box sx={{ flexGrow: 1, height: "100%" }}>
        <TabList paths={Object.keys(files)} selectedPath={selectedPath} onChange={onClickTab} />
        <Editor
          value={files[selectedPath]}
          language={language}
          theme="vs-dark"
          options={{ readOnly: true }}
        />
      </Box>
    </Box>
  );
}

export default function Comp() {
  const files: Record<string, string> = {
    "packages/modules/[nameOrId].tsx": "function foo() { return 1; }",
    "pages/api/modules.ts": "\nfunction bar() { return 2; }",
    "package.json": "\n\nfunction baz() { return 3; }",
  };

  return (
    <Box sx={{ width: "100vw", height: "100vh" }}>
      <CustomEditor files={files} />
    </Box>
  );
}
