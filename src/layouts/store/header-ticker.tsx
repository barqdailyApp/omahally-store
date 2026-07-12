"use client";

import { Box, Stack, Typography } from "@mui/material";

import Iconify from "@/components/iconify";

import { HEADER } from "../config-layout";

const REPEAT_COUNT = 4;
const SCROLL_DURATION = 22;

interface Props {
  text: string;
}

export default function HeaderTicker({ text }: Props) {
  const renderGroup = (groupKey: string) => (
    <Stack direction="row" alignItems="center" sx={{ flexShrink: 0 }}>
      {Array.from({ length: REPEAT_COUNT }).map((_, index) => (
        <Stack
          key={`${groupKey}-${index}`}
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ px: 2 }}
        >
          <Typography
            variant="caption"
            fontWeight={600}
            color="common.white"
            whiteSpace="nowrap"
          >
            {text}
          </Typography>
          <Iconify icon="eva:flash-fill" width={14} sx={{ color: "common.white" }} />
        </Stack>
      ))}
    </Stack>
  );

  return (
    <Box
      sx={{
        height: HEADER.H_TICKER,
        bgcolor: "primary.main",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          animation: `ticker-scroll ${SCROLL_DURATION}s linear infinite`,
          "@keyframes ticker-scroll": {
            from: { transform: "translateX(0)" },
            to: { transform: "translateX(-50%)" },
          },
        }}
      >
        {renderGroup("a")}
        {renderGroup("b")}
      </Box>
    </Box>
  );
}
