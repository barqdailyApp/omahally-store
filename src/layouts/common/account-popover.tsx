"use client";

import { m } from "framer-motion";
import { getCookie } from "cookies-next";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Radio,
  Button,
  Dialog,
  RadioGroup,
  DialogTitle,
  ListItemIcon,
  ListItemText,
  DialogActions,
  DialogContent,
  FormControlLabel,
} from "@mui/material";

import { paths } from "@/routes/paths";
import { useRouter } from "@/routes/hooks";
import { RouterLink } from "@/routes/components";

import { useBoolean } from "@/hooks/use-boolean";

import { useAuthContext } from "@/auth/hooks";
import { COOKIES_KEYS } from "@/config-global";
import { useCartStore } from "@/contexts/cart-store";
import { saveFavAddress } from "@/actions/auth-methods";
import { fetchActiveWarehouses } from "@/actions/warehouse-actions";

import Iconify from "@/components/iconify";
import { varHover } from "@/components/animate";
import { useSnackbar } from "@/components/snackbar";
import { LoadingScreen } from "@/components/loading-screen";
import CustomPopover, { usePopover } from "@/components/custom-popover";

import AddressDialog from "@/sections/cart/address-select/address-dialog";

import { Warehouse } from "@/types/warehouse";

// ----------------------------------------------------------------------

type Option = { label: string; icon: string } & (
  | { linkTo: string }
  | { onClick: VoidFunction }
);

const BASE_OPTIONS: Option[] = [
  {
    label: "home",
    linkTo: paths.home,
    icon: "tabler:home",
  },
  {
    label: "favorite",
    linkTo: paths.favProducts,
    icon: "mdi:heart-outline",
  },
  {
    label: "orders",
    linkTo: paths.orders,
    icon: "mynaui:package",
  },
];

// ----------------------------------------------------------------------

interface AccountPopoverProps {
  isMobile?: boolean;
  isAddressRequired?: boolean;
}

export default function AccountPopover({
  isMobile,
  isAddressRequired,
}: AccountPopoverProps) {
  const t = useTranslations();
  const { authenticated } = useAuthContext();

  const [searchParams, setSearchParams] = useState("");

  useEffect(() => {
    setSearchParams(
      new URLSearchParams({
        returnTo: window.location.pathname,
      }).toString(),
    );
  }, []);

  if (authenticated)
    return (
      <AccountPopoverContent
        isMobile={isMobile}
        isAddressRequired={isAddressRequired}
      />
    );

  const loginHref = `${paths.auth.jwt.login}?${searchParams}`;
  const loginLabel = t("Global.Label.login");

  if (isMobile) {
    return (
      <Tooltip title={loginLabel} arrow placement="bottom">
        <IconButton
          LinkComponent={RouterLink}
          href={loginHref}
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            border: "1px solid",
            borderColor: "divider",
            color: "text.primary",
          }}
        >
          <Iconify icon="solar:user-bold" width={22} />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Button
      variant="outlined"
      LinkComponent={RouterLink}
      href={loginHref}
      startIcon={<Iconify icon="solar:user-bold" width={20} />}
      sx={{
        flexShrink: 0,
        borderRadius: 2.5,
        px: 2,
        py: 1.25,
        borderColor: "divider",
        color: "text.primary",
        fontWeight: 600,
        "&:hover": {
          borderColor: "divider",
        },
      }}
    >
      {loginLabel}
    </Button>
  );
}

function AccountPopoverContent({
  isMobile,
  isAddressRequired,
}: {
  isMobile?: boolean;
  isAddressRequired?: boolean;
}) {
  const t = useTranslations("Navigation");
  const router = useRouter();
  const popover = usePopover();
  const addressesDialog = useBoolean();
  const changeStoreDialog = useBoolean();
  const { enqueueSnackbar } = useSnackbar();
  const { user, logout } = useAuthContext();
  const { initCart } = useCartStore();

  const OPTIONS: Option[] = [
    ...BASE_OPTIONS,
    isAddressRequired === false
      ? {
          label: "change_store",
          onClick: changeStoreDialog.onTrue,
          icon: "mdi:store-edit-outline",
        }
      : {
          label: "addresses",
          onClick: addressesDialog.onTrue,
          icon: "mdi:house-edit-outline",
        },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      initCart();
      router.push(paths.home);
      popover.onClose();
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Unable to logout!", { variant: "error" });
    }
  };

  const handleClickItem = (action: string | VoidFunction) => {
    popover.onClose();
    if (typeof action === "string") {
      router.push(action);
    } else action();
  };

  const accountButton = (
    <IconButton
      component={m.button}
      whileTap="tap"
      whileHover="hover"
      variants={varHover(1.05)}
      onClick={popover.onOpen}
      sx={{
        width: isMobile ? 44 : 40,
        height: isMobile ? 44 : 40,
        borderRadius: 2.5,
        background: (theme) => alpha(theme.palette.grey[500], 0.08),
        ...(popover.open && {
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
        }),
      }}
    >
      <Avatar
        src={user?.avatar}
        alt={user?.name}
        sx={{
          width: 36,
          height: 36,
          border: (theme) => `solid 2px ${theme.palette.background.default}`,
        }}
      >
        {user?.name?.charAt(0).toUpperCase()}
      </Avatar>
    </IconButton>
  );

  return (
    <>
      {isMobile ? (
        <Tooltip title={user?.name || t("home")} arrow placement="bottom">
          <span>{accountButton}</span>
        </Tooltip>
      ) : (
        accountButton
      )}

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        sx={{ width: 200, p: 0 }}
      >
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {user?.name}
          </Typography>

          <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
            {user?.phone}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: "dashed" }} />

        <Stack sx={{ p: 1 }}>
          {OPTIONS.map((option) => (
            <MenuItem
              key={option.label}
              onClick={() =>
                handleClickItem(
                  "linkTo" in option ? option.linkTo : option.onClick,
                )
              }
            >
              <ListItemIcon sx={{ minWidth: "20px !important" }}>
                <Iconify
                  icon={option.icon}
                  sx={{ "&": { margin: "0 !important" } }}
                />
              </ListItemIcon>
              <ListItemText>{t(option.label)}</ListItemText>
            </MenuItem>
          ))}
        </Stack>

        <Divider sx={{ borderStyle: "dashed" }} />

        <MenuItem
          onClick={handleLogout}
          sx={{ m: 1, fontWeight: "fontWeightBold", color: "error.main" }}
        >
          <ListItemIcon sx={{ minWidth: "20px !important" }}>
            <Iconify
              icon="mdi:logout"
              sx={{ "&": { margin: "0 !important" } }}
            />
          </ListItemIcon>
          <ListItemText>{t("logout")}</ListItemText>
        </MenuItem>
      </CustomPopover>

      {addressesDialog.value && (
        <AddressDialog
          open={addressesDialog.value}
          onClose={addressesDialog.onFalse}
        />
      )}

      {changeStoreDialog.value && (
        <ChangeStoreDialog
          open={changeStoreDialog.value}
          onClose={changeStoreDialog.onFalse}
        />
      )}
    </>
  );
}

function ChangeStoreDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: VoidFunction;
}) {
  const t = useTranslations("Pages.GuestGate");
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(
    () => (getCookie(COOKIES_KEYS.warehouseId) as string | undefined) ?? null,
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchActiveWarehouses().then((res) => {
      setWarehouses("error" in res ? [] : res.data);
      setLoading(false);
    });
  }, []);

  const handleConfirm = async () => {
    const warehouse = warehouses.find((w) => w.id === selectedWarehouseId);
    if (!warehouse) return;
    setSaving(true);
    await saveFavAddress(
      {
        latitude: warehouse.latitude.toString(),
        longitude: warehouse.longitude.toString(),
      },
      warehouse.id,
    );
    setSaving(false);
    onClose();
    router.refresh();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t("warehouse_title")}</DialogTitle>
      <DialogContent>
        {!loading ? (
          <RadioGroup
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(e.target.value)}
          >
            {warehouses.map((w) => (
              <FormControlLabel
                key={w.id}
                value={w.id}
                control={<Radio />}
                label={w.name}
              />
            ))}
          </RadioGroup>
        ) : (
          <LoadingScreen sx={{ py: 5 }} />
        )}
      </DialogContent>
      <DialogActions>
        <LoadingButton
          variant="contained"
          loading={saving}
          disabled={!selectedWarehouseId}
          onClick={handleConfirm}
        >
          {t("confirm_location")}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
