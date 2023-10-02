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

const SELECT_COLOR = "#1E1E1E";
const PASSIVE_COLOR = "#2D2D2D";
const TEXT_COLOR = "#cccccccc";

interface TabListProps {
  paths: string[];
  selectedPath: string;
  onChange(tab: string): void;
}

const typoProps = {
  textColor: TEXT_COLOR,
  level: "body-sm",
  fontSize: 13,
  fontFamily: "Segoe UI",
  alignSelf: "center",
};

function TabList({ paths, selectedPath, onChange }: TabListProps) {
  const parts = selectedPath.split("/");
  const partComponents = parts.map((part, idx) => (
    <React.Fragment key={part}>
      <Typography {...typoProps}>{part}</Typography>
      {idx !== parts.length - 1 && <ChevronRight />}
    </React.Fragment>
  ));

  return (
    <Box sx={{ backgroundColor: PASSIVE_COLOR }}>
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
                backgroundColor: selectedPath === path ? SELECT_COLOR : PASSIVE_COLOR,
                borderRight: "1px solid #111111",
                alignItems: "center",
              }}
            >
              <FileIcon language={language} />
              <Typography {...typoProps} mx={1}>
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
        sx={{ backgroundColor: SELECT_COLOR, height: 20, pl: 1, pb: "4px" }}
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

  function nodeToTreeList(node: Node) {
    return (
      <TreeItem
        key={node.id}
        nodeId={node.id.toString()}
        label={<Typography {...typoProps}>{node.name}</Typography>}
        sx={{ "MuiTreeItem-root": { backgroundColor: "red" } }}
      >
        {node.children ? Object.values(node.children).map(nodeToTreeList) : null}
      </TreeItem>
    );
  }

  return (
    <TreeView defaultCollapseIcon={<ExpandMoreIcon />} defaultExpandIcon={<ChevronRightIcon />}>
      {Object.values(root.children!).map(nodeToTreeList)}
    </TreeView>
  );
}

interface TreeListProps {
  files: Record<string, string>;
}

function TreeList({ files }: TreeListProps) {
  return convertFilesToTreeList(Object.keys(files));
}

interface CustomEditorProps {
  projectName?: string;
  files: Record<string, string>;
}

function CustomEditor({ projectName, files }: CustomEditorProps) {
  const [selectedPath, setSelectedPath] = useState<string>(Object.keys(files)[0]);
  const language = getLanguage(selectedPath);

  function onClickTab(path: string) {
    setSelectedPath(path);
  }

  return (
    <Box display="flex" flexDirection="row" sx={{ width: "100%", height: "100%" }}>
      <Box
        sx={{
          width: "250px",
          height: "100vh",
          backgroundColor: "#252526",
          color: TEXT_COLOR,
          flexShrink: 0,
        }}
      >
        <Box p={1} pl={2}>
          <Typography {...typoProps} fontSize={11}>
            EXPLORER: {projectName?.toUpperCase()}
          </Typography>
        </Box>
        <TreeList files={files} />
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        sx={{ flexGrow: 1, height: "100%", flexShrink: 1 }}
      >
        <TabList paths={Object.keys(files)} selectedPath={selectedPath} onChange={onClickTab} />
        <Editor
          value={files[selectedPath]}
          language={language}
          theme="vs-dark"
          options={{ readOnly: true, automaticLayout: true }}
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
    <Box sx={{ width: "100vw", height: "100vh", m: 0, p: 0 }}>
      <CustomEditor projectName="foo bar baz" files={files} />
    </Box>
  );
}
