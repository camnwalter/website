import Editor from "@monaco-editor/react";
import { ChevronRight, Close } from "@mui/icons-material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, IconButton, styled, Typography } from "@mui/joy";
import { TreeItem, treeItemClasses, TreeItemProps } from "@mui/x-tree-view/TreeItem";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { useState } from "react";
import * as React from "react";

import FileIcon, { getLanguage } from "./fileIcons";

enum Colors {
  TAB_SELECTED = "#1E1E1E",
  TAB_UNSELECTED = "#2D2D2D",
  PATH_BAR = TAB_SELECTED,
  TEXT = "#cccccccc",
  EXPLORER = "#252526",
  FILE_HOVER = "#2A2D2E",
  FILE_SELECTED = "#37373D",
  FILE_FOCUSED = "#04395E",
  FILE_FOCUSED_BORDER = "#007FD4",
  EDITOR_BACKGROUND = TAB_SELECTED,
  BUTTON_HIGHLIGHT = "#383B41",
}

interface TabListProps {
  paths: string[];
  selectedPath?: string;
  onSwitchTab(tab: string): void;
  onCloseTab(tab: string): void;
}

const typoProps = {
  textColor: Colors.TEXT,
  level: "body-sm",
  fontSize: 13,
  fontFamily: "Segoe UI",
  alignSelf: "center",
} as const;

function TabList({ paths, selectedPath, onSwitchTab, onCloseTab }: TabListProps) {
  if (selectedPath) {
    const parts = selectedPath.split("/");
    const partComponents = parts.map((part, idx) => (
      <React.Fragment key={part}>
        <Typography {...typoProps}>{part}</Typography>
        {idx !== parts.length - 1 && <ChevronRight />}
      </React.Fragment>
    ));

    return (
      <Box sx={{ backgroundColor: Colors.TAB_UNSELECTED, "& > *": { userSelect: "none" } }}>
        <Box display="flex">
          {paths.map(path => {
            const lastSeparator = path.lastIndexOf("/");
            const name = lastSeparator === -1 ? path : path.substring(lastSeparator + 1);

            return (
              <Box
                key={path}
                display="flex"
                padding="5px"
                onClick={() => onSwitchTab(path)}
                onAuxClick={e => {
                  if (e.button === 1) onCloseTab(path);
                }}
                sx={{
                  backgroundColor:
                    selectedPath === path ? Colors.TAB_SELECTED : Colors.TAB_UNSELECTED,
                  borderRight: "1px solid #111111",
                  alignItems: "center",
                  alignContent: "center",
                  alignSelf: "center",
                  cursor: "pointer",
                }}
              >
                <FileIcon path={path} />
                <Typography {...typoProps} mx={1}>
                  {name}
                </Typography>
                <IconButton
                  onClick={e => {
                    e.stopPropagation();
                    onCloseTab(path);
                  }}
                  sx={{
                    p: 0,
                    "--IconButton-size": "10px",
                    ":hover": {
                      backgroundColor: Colors.BUTTON_HIGHLIGHT,
                    },
                  }}
                >
                  <Close
                    sx={{
                      fontSize: 16,
                      color: path === selectedPath ? Colors.TEXT : Colors.TAB_UNSELECTED,
                    }}
                  />
                </IconButton>
              </Box>
            );
          })}
        </Box>
        <Box
          display="flex"
          alignItems="center"
          sx={{ backgroundColor: Colors.TAB_SELECTED, height: 20, pl: 1, pb: "4px" }}
        >
          {partComponents}
        </Box>
      </Box>
    );
  }

  return <Box sx={{ backgroundColor: Colors.TAB_UNSELECTED, "& > *": { userSelect: "none" } }} />;
}

type StyledTreeItemProps = TreeItemProps & {
  labelIcon?: React.ReactNode;
  labelInfo?: string;
  labelText: string;
};

const StyledTreeItemRoot = styled(TreeItem)({
  [`& .${treeItemClasses.content}`]: {
    position: "relative",
    left: "-300px",
    width: "calc(100% + 300px)",
    overflow: "hidden",
    margin: 1,
    "& > *": {
      position: "relative",
      left: "300px",
    },
    "&:hover": {
      backgroundColor: Colors.FILE_HOVER,
    },
    "&.Mui-focused, &.Mui-selected": {
      backgroundColor: Colors.FILE_SELECTED,
    },
    "&.Mui-selected.Mui-focused": {
      backgroundColor: Colors.FILE_FOCUSED,
      border: `1px solid ${Colors.FILE_FOCUSED_BORDER}`,
      margin: 0,
    },
    [`& .${treeItemClasses.label}`]: {
      paddingLeft: 0,
    },
  },
}) as unknown as typeof TreeItem;

const StyledTreeItem = React.forwardRef(function StyledTreeItem(
  props: StyledTreeItemProps,
  ref: React.Ref<HTMLLIElement>,
) {
  const { labelIcon, labelInfo, labelText, ...other } = props;

  return (
    <StyledTreeItemRoot
      label={
        <Box display="flex">
          {labelIcon && (
            <Box position="absolute" left="-18px" top="1px">
              {labelIcon}
            </Box>
          )}
          <Typography {...typoProps} sx={{ fontWeight: "inherit", flexGrow: 1 }}>
            {labelText}
          </Typography>
          <Typography {...typoProps}>{labelInfo}</Typography>
        </Box>
      }
      {...other}
      ref={ref}
    />
  );
});

interface Node {
  id: number;
  name: string;
  fullPath?: string; // only non-null if this is a file, i.e., if children is null
  children?: Record<string, Node>;
}

function convertFilesToTreeList(paths: string[], onClickFile: (path: string) => void) {
  const root: Node = { id: 0, name: "__root" };
  let nextId = 1;

  for (const path of paths) {
    const parts = path.split("/");
    let node = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!node.children) node.children = {};

      if (!node.children[part]) {
        node.children[part] = { id: nextId++, name: part };
        if (i == parts.length - 1) node.children[part].fullPath = path;
      }
      node = node.children[part]!;
    }
  }

  function nodeToTreeList(node: Node) {
    const children = node.children ? Object.values(node.children) : null;
    if (children) {
      children.sort((a, b) => {
        if (a.children && !b.children) return -1;
        if (!a.children && b.children) return 1;
        return a.name.localeCompare(b.name);
      });
    }

    return (
      <StyledTreeItem
        key={node.id}
        nodeId={node.id.toString()}
        labelText={node.name}
        labelIcon={!node.children && <FileIcon path={node.name} />}
        sx={{ "& > *": { userSelect: "none" } }}
        onClick={() => (node.fullPath ? onClickFile(node.fullPath) : null)}
      >
        {children?.map(nodeToTreeList) ?? null}
      </StyledTreeItem>
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
  onClickFile(path: string): void;
}

function TreeList({ files, onClickFile }: TreeListProps) {
  return convertFilesToTreeList(Object.keys(files), onClickFile);
}

interface CustomEditorProps {
  projectName?: string;
  files: Record<string, string>;
}

export default function CustomEditor({ projectName, files }: CustomEditorProps) {
  const [selectedPath, setSelectedPath] = useState<string | undefined>();
  const [openFiles, setOpenFiles] = useState<Record<string, string>>({});
  const language = selectedPath ? getLanguage(selectedPath) : undefined;

  function onClickFile(path: string) {
    setOpenFiles({ ...openFiles, [path]: files[path] });
    setSelectedPath(path);
  }

  function onCloseTab(path: string) {
    const newFiles = { ...openFiles };
    delete newFiles[path];
    setOpenFiles(newFiles);

    if (path === selectedPath) {
      const filePaths = Object.keys(newFiles);
      if (filePaths.length > 0) {
        let index = Object.keys(openFiles).indexOf(path);
        if (index >= filePaths.length) index = filePaths.length - 1;
        setSelectedPath(filePaths[index]);
      } else {
        setSelectedPath(undefined);
      }
    }
  }

  const editor = selectedPath ? (
    <Editor
      value={selectedPath ? files[selectedPath] : undefined}
      language={language}
      theme="vs-dark"
      options={{ readOnly: true, automaticLayout: true }}
    />
  ) : (
    <Box width="100%" height="100%" sx={{ backgroundColor: Colors.EDITOR_BACKGROUND }} />
  );

  return (
    <Box display="flex" flexDirection="row" sx={{ width: "100%", height: "100%" }}>
      <Box
        sx={{
          width: "250px",
          height: "100%",
          backgroundColor: "#252526",
          color: Colors.TEXT,
          flexShrink: 0,
        }}
      >
        <Box p={1} pl={2}>
          <Typography {...typoProps} fontSize={11}>
            EXPLORER: {projectName?.toUpperCase()}
          </Typography>
        </Box>
        <TreeList files={files} onClickFile={onClickFile} />
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        sx={{ flexGrow: 1, height: "100%", flexShrink: 1 }}
      >
        <TabList
          paths={Object.keys(openFiles)}
          selectedPath={selectedPath}
          onSwitchTab={setSelectedPath}
          onCloseTab={onCloseTab}
        />
        {editor}
      </Box>
    </Box>
  );
}
