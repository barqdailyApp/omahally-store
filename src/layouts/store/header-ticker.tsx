"use client";

import { Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import Iconify from "@/components/iconify";

import { HEADER } from "../config-layout";
import styles from "./header-ticker.module.css";

const REPEAT_COUNT = 4;

interface Props {
  text: string;
}

export default function HeaderTicker({ text }: Props) {
  const theme = useTheme();

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
            variant="body2"
            fontWeight={600}
            color="common.white"
            whiteSpace="nowrap"
          >
            {text}
          </Typography>
          <Iconify icon="eva:flash-fill" width={16} sx={{ color: "common.white" }} />
        </Stack>
      ))}
    </Stack>
  );

  return (
    <div
      className={styles.wrapper}
      style={{
        height: HEADER.H_TICKER,
        backgroundColor: theme.palette.primary.main,
      }}
    >
      <div className={styles.track}>
        {renderGroup("a")}
        {renderGroup("b")}
      </div>
    </div>
  );
}
