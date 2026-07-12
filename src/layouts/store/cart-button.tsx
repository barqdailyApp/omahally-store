"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { Badge, Button, Tooltip, IconButton } from "@mui/material";

import { paths } from "@/routes/paths";

import { useCartStore } from "@/contexts/cart-store";

import Iconify from "@/components/iconify";

// ----------------------------------------------------------------------

interface CartButtonProps {
  isMobile?: boolean;
}

export default function CartButton({ isMobile }: CartButtonProps) {
  const t = useTranslations("Global.Label");
  const quantity = useCartStore((state) =>
    state.products.reduce((sum, product) => sum + product.quantity, 0),
  );

  const cartLabel = t("cart");

  if (isMobile) {
    return (
      <Tooltip title={cartLabel} arrow placement="bottom">
        <Badge
          badgeContent={quantity}
          sx={{
            "& .MuiBadge-badge": {
              bgcolor: "#FFC107",
              color: "#000",
              fontWeight: 700,
            },
          }}
        >
          <IconButton
            LinkComponent={Link}
            href={paths.cart}
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              border: "1px solid",
              borderColor: "divider",
              color: "text.primary",
            }}
          >
            <Iconify icon="bxs:cart-alt" width={22} />
          </IconButton>
        </Badge>
      </Tooltip>
    );
  }

  return (
    <Badge
      badgeContent={quantity}
      sx={{
        "& .MuiBadge-badge": {
          bgcolor: "#FFC107",
          color: "#000",
          fontWeight: 700,
        },
      }}
    >
      <Button
        component={Link}
        href={paths.cart}
        color="primary"
        variant="contained"
        startIcon={<Iconify icon="bxs:cart-alt" width={22} />}
        sx={{
          borderRadius: 2.5,
          px: 2,
          py: 1.25,
          color: "white",
          fontWeight: 600,
        }}
      >
        {cartLabel}
      </Button>
    </Badge>
  );
}
