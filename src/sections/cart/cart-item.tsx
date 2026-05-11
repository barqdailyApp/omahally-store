import Image from "next/image";
import { useTranslations } from "next-intl";

import {
  Box,
  Chip,
  Link,
  Stack,
  Tooltip,
  IconButton,
  Typography,
} from "@mui/material";

import { paths } from "@/routes/paths";
import { RouterLink } from "@/routes/components";

import { useCurrency } from "@/utils/format-number";

import { CartProduct } from "@/contexts/cart-store";

import Iconify from "@/components/iconify";

import IncrementerButton from "../products/incrementer-button";

export default function CartItem({ product }: { product: CartProduct }) {
  const t = useTranslations("Pages.Orders.Single.Shipment");
  const tCart = useTranslations("Pages.Cart");
  const currency = useCurrency();
  const unitPrice = product.product_price + product.hidden_options_price;

  const totalPrice = (unitPrice + product.options_price) * product.quantity;

  const renderTopRow = (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Image
        src={product.image}
        alt={product.name}
        width={60}
        height={60}
        style={{
          borderRadius: "50px",
          objectFit: "cover",
        }}
      />

      <Box flexGrow={1}>
        <Link
          component={RouterLink}
          href={`${paths.products}/${product.product_id}`}
          underline="hover"
          color="inherit"
          sx={{
            "&:hover": {
              color: "primary.main",
            },
          }}
        >
          <Typography
            variant="body1"
            fontWeight="700"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: "2",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {product.name}
          </Typography>
        </Link>
        <Typography variant="subtitle2" fontWeight="400" mt={1}>
          <Typography
            variant="body2"
            fontWeight="bold"
            component="span"
            color="primary"
          >
            {currency(unitPrice)}
          </Typography>
        </Typography>
        {/* Display Options */}
        {product.product_option_groups.length > 0 && (
          <Stack direction="row" spacing={0.5} mt={1} flexWrap="wrap" gap={0.5}>
            {product.product_option_groups.flatMap((group) =>
              group.options
                .filter((option) => option.is_selected)
                .map((option) => (
                  <Chip
                    key={group.id}
                    label={
                      <Typography variant="caption">
                        {option.name}
                        {group.show_price && Number(option.price) > 0 && (
                          <Typography
                            variant="caption"
                            component="span"
                            color="primary"
                            sx={{ ml: 0.5, fontWeight: 600 }}
                          >
                            +{currency(option.price, false)}
                          </Typography>
                        )}
                      </Typography>
                    }
                    size="small"
                    variant="outlined"
                    sx={{ height: "auto", py: 0.5 }}
                  />
                )),
            )}
          </Stack>
        )}
      </Box>
    </Stack>
  );

  const renderBottomRow = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ mt: 1 }}
    >
      <Typography variant="subtitle2">
        {`${t("total")} : `}
        <Typography variant="inherit" fontWeight="700" component="span">
          {currency(totalPrice)}
        </Typography>
      </Typography>

      <Stack direction="row" alignItems="center" spacing={1}>
        <Tooltip title={tCart("view_product") || "View Product"}>
          <IconButton
            component={RouterLink}
            href={`${paths.products}/${product.product_id}`}
            size="small"
            color="primary"
            sx={{ flexShrink: 0 }}
          >
            <Iconify icon="gridicons:external" />
          </IconButton>
        </Tooltip>
        <Tooltip title={tCart("update_item") || "Update Item"}>
          <IconButton
            component={RouterLink}
            href={`${paths.cart}/${product.id}`}
            size="small"
            color="primary"
            sx={{ flexShrink: 0 }}
          >
            <Iconify icon="boxicons:edit" />
          </IconButton>
        </Tooltip>

        <IncrementerButton
          cartProductId={product.id}
          sx={{ flexShrink: 0, width: "fit-content" }}
          is_quantity_available
        />
      </Stack>
    </Stack>
  );

  return (
    <Box px={2}>
      <Stack spacing={1} justifyContent="flex-start">
        {renderTopRow}
        {renderBottomRow}
      </Stack>
    </Box>
  );
}
