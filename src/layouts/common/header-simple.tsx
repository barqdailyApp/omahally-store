"use client";

import AppBar from "@mui/material/AppBar";
import { Container } from "@mui/material";
import Toolbar from "@mui/material/Toolbar";
import { useTheme } from "@mui/material/styles";

import { useOffSetTop } from "@/hooks/use-off-set-top";

import { HEADER } from "../config-layout";
import LanguagePopover from "./language-popover";

// ----------------------------------------------------------------------

export default function HeaderSimple() {
  const theme = useTheme();

  const offsetTop = useOffSetTop(HEADER.H_OFFSET);

  return (
    <AppBar
      sx={{
        bgcolor: theme.palette.background.default,
        borderBottom: `solid 1px ${theme.palette.divider}`,
        transition: theme.transitions.create(["transform"], {
          easing: theme.transitions.easing.easeInOut,
          duration: theme.transitions.duration.shorter,
        }),
        ...(offsetTop && {
          transform: `translateY(-100%)`,
        }),
      }}
    >
      <Container>
        <Toolbar
          sx={{
            justifyContent: "flex-end",
            minHeight: `${HEADER.H_SIMPLE}px !important`,
          }}
        >
          <LanguagePopover />
        </Toolbar>
      </Container>
    </AppBar>
  );
}
