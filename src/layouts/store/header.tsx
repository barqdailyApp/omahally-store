"use client";

import Stack from "@mui/material/Stack";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { useTheme } from "@mui/material/styles";
import { Button, Container, useMediaQuery } from "@mui/material";

import { useBoolean } from "@/hooks/use-boolean";
import { useOffSetTop } from "@/hooks/use-off-set-top";

import { bgBlur } from "@/theme/css";

import Logo from "@/components/logo";
import Iconify from "@/components/iconify";

import StoreSearch from "./search";
import CartButton from "./cart-button";
import { HEADER } from "../config-layout";
import AccountPopover from "../common/account-popover";
import LanguagePopover from "../common/language-popover";

// ----------------------------------------------------------------------

interface Props {
  logo?: string;
  isAddressRequired?: boolean;
}

export default function StoreHeader({ logo, isAddressRequired }: Props) {
  const theme = useTheme();

  const offsetTop = useOffSetTop(HEADER.H_OFFSET);

  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const openXsScreenSearch = useBoolean();

  const renderContent = (
    <>
      <Logo image={logo} sx={{ marginInlineStart: 0.5, marginInlineEnd: 1 }} />

      {isSm ? (
        <Button
          onClick={openXsScreenSearch.onToggle}
          size="small"
          sx={{
            minWidth: 0,
            width: 44,
            height: 44,
            borderRadius: 2.5,
            flexShrink: 0,
            marginInlineEnd: 1,
            border: "1px solid",
            borderColor: "divider",
            color: "text.primary",
          }}
        >
          <Iconify
            icon={
              openXsScreenSearch.value
                ? "eva:close-outline"
                : "material-symbols:search"
            }
            width={22}
          />
        </Button>
      ) : (
        <StoreSearch />
      )}

      <Stack
        flexGrow={1}
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        spacing={1.5}
        flexShrink={0}
      >
        <LanguagePopover isMobile />
        <AccountPopover isMobile={isSm} isAddressRequired={isAddressRequired} />
        <CartButton isMobile={isSm} />
      </Stack>
    </>
  );

  return (
    <AppBar
      sx={{
        top: 0,
        height: HEADER.H_MOBILE + (isSm && openXsScreenSearch.value ? 60 : 0),
        overflow: "hidden",
        borderBottom: `solid 1px ${theme.palette.divider}`,
        zIndex: theme.zIndex.appBar,
        ...bgBlur({
          color: theme.palette.background.default,
        }),
        transition: theme.transitions.create(["top", "height"], {
          duration: theme.transitions.duration.shorter,
        }),
        ...(offsetTop && {
          borderColor: theme.palette.divider,
        }),
      }}
    >
      <Container sx={{ minHeight: "100%" }}>
        <Toolbar sx={{ height: HEADER.H_MOBILE }}>{renderContent}</Toolbar>

        {isSm && openXsScreenSearch.value && <StoreSearch />}
      </Container>
    </AppBar>
  );
}
