"use client";

import { Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

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
        <Typography
          key={`${groupKey}-${index}`}
          variant="body2"
          fontWeight={600}
          color="common.white"
          whiteSpace="nowrap"
          sx={{ px: 2 }}
        >
          {text}
        </Typography>
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
