import { m } from "framer-motion";
import { getCookie } from "cookies-next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import LoadingButton from "@mui/lab/LoadingButton";
import {
  Radio,
  Dialog,
  Tooltip,
  IconButton,
  RadioGroup,
  DialogTitle,
  DialogActions,
  DialogContent,
  FormControlLabel,
} from "@mui/material";

import { useBoolean } from "@/hooks/use-boolean";

import { COOKIES_KEYS } from "@/config-global";
import { saveFavAddress } from "@/actions/auth-methods";
import { fetchActiveWarehouses } from "@/actions/warehouse-actions";

import Iconify from "@/components/iconify";
import { varHover } from "@/components/animate";
import { LoadingScreen } from "@/components/loading-screen";

import { Warehouse } from "@/types/warehouse";

export default function WarehouseSelect() {
  const t = useTranslations("Navigation");
  const changeStoreDialog = useBoolean();

  return (
    <>
      <Tooltip title={t("change_store")}>
        <IconButton
          component={m.button}
          whileTap="tap"
          whileHover="hover"
          variants={varHover(1.05)}
          onClick={changeStoreDialog.onTrue}
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            border: "1px solid",
            borderColor: "divider",
            color: "text.primary",
            "&:hover": { bgcolor: "#ebe6de" },
            ...(changeStoreDialog.value && { bgcolor: "#ebe6de" }),
          }}
        >
          <Iconify icon="iconoir:delivery-truck" width={22} />
        </IconButton>
      </Tooltip>
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
