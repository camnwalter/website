"use client";

import { Close, CloudUpload } from "@mui/icons-material";
import {
  Autocomplete,
  Badge,
  Box,
  Button,
  Chip,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Sheet,
  Stack,
  Typography,
} from "@mui/joy";
import colors from "@mui/joy/colors";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { switchMode, useMode } from "utils/layout";

import MarkdownEditor from "../MarkdownEditor";

interface ImageProps {
  value?: string;
  setValue(value?: string): void;
}

// TODO: Drag and drop
function ImageUploader({ value, setValue }: ImageProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => inputRef.current!.click();

  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const file = e.target.files?.[0];
    if (file) {
      setValue(URL.createObjectURL(file));
    }
  };

  const inputElement = (
    <input
      type="file"
      id="file"
      ref={inputRef}
      onChange={handleChangeFile}
      style={{ display: "none" }}
    />
  );

  if (!value) {
    return (
      <Stack
        sx={{
          width: 300,
          height: 200,
          flexShrink: 0,
          ml: 8,
          outline: theme => `dashed ${theme.vars.palette.neutral[switchMode(600, 400)]}`,
          borderRadius: 10,
          cursor: "pointer",
          ":hover": {
            outline: theme => `dashed ${theme.vars.palette.neutral[switchMode(400, 600)]}`,
            backgroundColor: theme => theme.vars.palette.neutral[switchMode(700, 200)],
          },
        }}
        justifyContent="center"
        alignItems="center"
        onClick={handleClick}
      >
        <CloudUpload sx={{ fontSize: 84 }} />
        <Typography>Image</Typography>
        {/* <Typography>Drag files to Upload</Typography> */}
      </Stack>
    );
  }

  return (
    <Badge
      color="danger"
      badgeContent={<Close />}
      sx={{ cursor: "pointer" }}
      onClick={() => setValue()}
    >
      <Stack
        sx={{
          width: 300,
          height: 200,
          flexShrink: 0,
          ml: 8,
          cursor: "pointer",
          outline: theme => `solid ${theme.vars.palette.neutral[switchMode(700, 300)]}`,
          borderRadius: 10,
          ":hover": {
            outline: theme => `dashed ${theme.vars.palette.neutral[switchMode(400, 600)]}`,
            backgroundColor: theme => theme.vars.palette.neutral[switchMode(700, 200)],
          },
        }}
        justifyContent="center"
        alignItems="center"
        onClick={handleClick}
      >
        <img
          src={value}
          alt="module image"
          width="100%"
          height="100%"
          style={{ objectFit: "contain" }}
        />
        {inputElement}
      </Stack>
    </Badge>
  );
}

interface Props {
  tags: string[];
}

export default function CreateComponent({ tags: availableTags }: Props) {
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [summary, setSummary] = useState<string | undefined>();
  const [description, setDescription] = useState<string | undefined>();
  const [tags, setTags] = useState<string[]>([]);

  const router = useRouter();
  const mode = useMode();

  const handleSubmit = () => {};

  return (
    <Box
      width="100%"
      mt={10}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      justifyItems="center"
      alignItems="center"
      alignContent="center"
    >
      <Sheet variant="soft" sx={{ width: "100%", maxWidth: 1000, borderRadius: 10, p: 3 }}>
        <Box mb={2} width="100%" display="flex" justifyContent="center">
          <Typography level="h3">Create a Module</Typography>
        </Box>
        <Stack direction="row" justifyContent="space-between">
          <Stack spacing={3} width="100%">
            <FormControl>
              <FormLabel>Module Name</FormLabel>
              <Input value={name} onChange={e => setName(e.target.value)} fullWidth />
              <FormHelperText>
                Must be 3-64 character long and can only have letters, numbers, and underscores
              </FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel>Tags</FormLabel>
              <Autocomplete
                multiple
                options={availableTags}
                value={tags}
                onChange={(_, value) => setTags(value)}
                getOptionDisabled={() => tags.length >= 4}
                renderTags={(tags, getTagProps) =>
                  tags.map((item, index) => (
                    // Note: getTagProps() returns an object with the key prop, but eslint can't
                    //       see that for some reason
                    // eslint-disable-next-line react/jsx-key
                    <Chip
                      variant="solid"
                      color="primary"
                      endDecorator={<Close fontSize="small" />}
                      {...getTagProps({ index })}
                    >
                      {item}
                    </Chip>
                  ))
                }
              />
              <FormHelperText>Choose up to 4 tags</FormHelperText>
            </FormControl>
          </Stack>
          <ImageUploader value={image} setValue={setImage} />
        </Stack>
        <FormControl sx={{ mt: 3 }}>
          <FormLabel>Summary</FormLabel>
          <Input value={summary} onChange={e => setSummary(e.target.value)} fullWidth />
          <FormHelperText>
            Displayed on the module preview card. Limited to 300 characters
          </FormHelperText>
        </FormControl>
        <Box mt={3}>
          <FormLabel sx={{ mb: 1 }}>Description</FormLabel>
          <MarkdownEditor value={description} setValue={setDescription} />
        </Box>
        <Stack direction="row" justifyContent="end" mt={2} spacing={4}>
          <Button
            onClick={() => router.back()}
            sx={{
              width: 150,
              color: colors.grey[switchMode(100, 800, mode)],
              backgroundColor: colors.red[switchMode(700, 400, mode)],
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            sx={{
              width: 150,
              color: colors.grey[switchMode(100, 800, mode)],
              backgroundColor: colors.green[switchMode(700, 400, mode)],
            }}
          >
            Submit
          </Button>
        </Stack>
      </Sheet>
    </Box>
  );
}
