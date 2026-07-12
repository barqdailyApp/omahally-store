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
import HeaderTicker from "./header-ticker";
import { HEADER } from "../config-layout";
import AccountPopover from "../common/account-popover";
import LanguagePopover from "../common/language-popover";
import WarehouseSelect from "../common/warehouse-select";

// ----------------------------------------------------------------------

interface Props {
  logo?: string;
  isAddressRequired?: boolean;
  simpleHeader?: boolean;
}

export default function StoreHeader({
  logo,
  isAddressRequired,
  simpleHeader,
}: Props) {
  const theme = useTheme();

  const offsetTop = useOffSetTop(HEADER.H_OFFSET);

  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const openXsScreenSearch = useBoolean();

  const renderSearch = isSm ? (
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
  );

  const renderContent = (
    <>
      <Logo image={logo} sx={{ marginInlineStart: 0.5, marginInlineEnd: 1 }} />

      {!simpleHeader ? renderSearch : null}

      <Stack
        flexGrow={1}
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        spacing={1.5}
        flexShrink={0}
      >
        <LanguagePopover isMobile />
        {!isAddressRequired && <WarehouseSelect />}
        {!simpleHeader && <AccountPopover isMobile={isSm} />}
        {!simpleHeader && <CartButton isMobile={isSm} />}
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
      <Container sx={{ minHeight: HEADER.H_TOOLBAR }}>
        <Toolbar sx={{ height: HEADER.H_TOOLBAR }}>{renderContent}</Toolbar>

        {isSm && openXsScreenSearch.value && <StoreSearch />}
      </Container>

      <HeaderTicker text="استمتع بتجربة تسوق مريحة واطلب الآن بأسعار مخفضة" />
    </AppBar>
  );
}
