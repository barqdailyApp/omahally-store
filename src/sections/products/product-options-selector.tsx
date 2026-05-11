"use client";

import { useCallback } from "react";
import { useSnackbar } from "notistack";
import { useTranslations } from "next-intl";

import {
  Box,
  Stack,
  Checkbox,
  Collapse,
  FormLabel,
  Typography,
  FormControl,
  FormControlLabel,
} from "@mui/material";

import { useCurrency } from "@/utils/format-number";

import { updateCartProductOptions } from "@/actions/cart-actions";

import { ProductOptionGroup } from "@/types/products";

import { useProductFormStore } from "./store/product-form-store";

export default function ProductOptionsSelector() {
  const t = useTranslations("Pages.Home.Product.Options");
  const currency = useCurrency();
  const { enqueueSnackbar } = useSnackbar();

  const {
    product,
    cartProduct,
    selectedOptions,
    setSelectedOptions,
    setCartProduct,
  } = useProductFormStore();

  const handleOptionToggle = useCallback(
    async (optionId: string, group: ProductOptionGroup) => {
      const isSelected = selectedOptions.includes(optionId);
      const groupSelectedOptions = selectedOptions.filter((id) =>
        group.options.some((opt) => opt.id === id),
      );

      let newSelectedOptions: string[];
      if (isSelected) {
        // Remove option and its child group selections if any
        newSelectedOptions = selectedOptions.filter((id) => id !== optionId);
        // Remove child group options if this option had child groups
        const option = group.options.find((opt) => opt.id === optionId);
        if (option?.child_groups) {
          option.child_groups.forEach((childGroup) => {
            childGroup.options.forEach((childOpt) => {
              newSelectedOptions = newSelectedOptions.filter(
                (id) => id !== childOpt.id,
              );
            });
          });
        }

        setSelectedOptions(newSelectedOptions);
        if (!cartProduct) {
          return;
        }

        const res = await updateCartProductOptions(
          cartProduct.id,
          newSelectedOptions,
        );

        if ("error" in res) {
          setSelectedOptions([...newSelectedOptions, optionId]);
          enqueueSnackbar(res.error, { variant: "error" });
        } else {
          setCartProduct(res);
        }
      } else {
        // Add option
        newSelectedOptions = [...selectedOptions, optionId];

        // Check if we exceed max_selection
        if (
          group.max_selection > 0 &&
          groupSelectedOptions.length >= group.max_selection
        ) {
          // Remove the first selected option in this group if we exceed max
          const firstSelected = groupSelectedOptions[0];
          newSelectedOptions = newSelectedOptions.filter(
            (id) => id !== firstSelected,
          );
        }

        setSelectedOptions(newSelectedOptions);
        if (!cartProduct) {
          return;
        }

        const res = await updateCartProductOptions(
          cartProduct.id,
          newSelectedOptions,
        );

        if ("error" in res) {
          setSelectedOptions(
            newSelectedOptions.filter((id) => id !== optionId),
          );
          enqueueSnackbar(res.error, { variant: "error" });
        } else {
          setCartProduct(res);
        }
      }
    },
    [
      selectedOptions,
      setSelectedOptions,
      cartProduct,
      enqueueSnackbar,
      setCartProduct,
    ],
  );

  const getGroupValidation = useCallback(
    (group: ProductOptionGroup) => {
      const groupSelectedOptions = selectedOptions.filter((id) =>
        group.options.some((opt) => opt.id === id),
      );
      const selectedCount = groupSelectedOptions.length;

      const isValid =
        selectedCount >= group.min_selection &&
        (group.max_selection === 0 || selectedCount <= group.max_selection);

      let error: string | null = null;
      if (selectedCount < group.min_selection) {
        error = t("select_at_least", { count: group.min_selection });
      } else if (
        group.max_selection > 0 &&
        selectedCount > group.max_selection
      ) {
        error = t("select_at_most", { count: group.max_selection });
      }

      return {
        isValid,
        selectedCount,
        error,
      };
    },
    [selectedOptions, t],
  );

  const getChildGroupValidation = useCallback(
    (childGroup: ProductOptionGroup, parentOptionId: string) => {
      const isParentSelected = selectedOptions.includes(parentOptionId);
      if (!isParentSelected) {
        return { isValid: true, selectedCount: 0, error: null };
      }

      const childSelectedOptions = selectedOptions.filter((id) =>
        childGroup.options.some((opt) => opt.id === id),
      );
      const selectedCount = childSelectedOptions.length;

      const isValid =
        selectedCount >= childGroup.min_selection &&
        (childGroup.max_selection === 0 ||
          selectedCount <= childGroup.max_selection);

      let error: string | null = null;
      if (selectedCount < childGroup.min_selection) {
        error = t("select_at_least", { count: childGroup.min_selection });
      } else if (
        childGroup.max_selection > 0 &&
        selectedCount > childGroup.max_selection
      ) {
        error = t("select_at_most", { count: childGroup.max_selection });
      }

      return {
        isValid,
        selectedCount,
        error,
      };
    },
    [selectedOptions, t],
  );

  return (
    <Stack spacing={3}>
      {product.product.product_option_groups.map((group) => {
        const validation = getGroupValidation(group);

        return (
          <FormControl
            key={group.id}
            component="fieldset"
            sx={{ width: "100%" }}
          >
            <FormLabel component="legend" sx={{ mb: 1, color: "text.primary" }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                flexWrap="wrap"
              >
                <Typography variant="subtitle1" color="text.primary">
                  {group.name}
                </Typography>
                {group.min_selection > 0 && (
                  <Typography
                    variant="caption"
                    color={
                      !validation.isValid && validation.error
                        ? "error.main"
                        : "text.secondary"
                    }
                  >
                    ({group.min_selection}
                    {group.max_selection > 0
                      ? ` - ${group.max_selection}`
                      : "+"}{" "}
                    {t("required")})
                  </Typography>
                )}
                {!validation.isValid && validation.error && (
                  <Typography variant="caption" color="error.main">
                    - {validation.error}
                  </Typography>
                )}
              </Stack>
            </FormLabel>

            <Stack spacing={1} sx={{ pl: 1 }}>
              {group.options.map((option) => {
                const isSelected = selectedOptions.includes(option.id);
                const hasChildGroups = !!option.child_groups?.length;

                return (
                  <Box key={option.id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleOptionToggle(option.id, group)}
                        />
                      }
                      label={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography>{option.name}</Typography>
                          {group.show_price &&
                            option.price &&
                            parseFloat(option.price) !== 0 && (
                              <Typography
                                variant="caption"
                                color="primary"
                                sx={{ fontWeight: 600 }}
                              >
                                +{currency(option.price)}
                              </Typography>
                            )}
                          {option.is_default && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              ({t("default")})
                            </Typography>
                          )}
                        </Stack>
                      }
                    />

                    {/* Child Groups - Only visible when parent is selected */}
                    {hasChildGroups && (
                      <Collapse in={isSelected} timeout="auto" unmountOnExit>
                        <Box sx={{ pl: 4, mt: 1 }}>
                          {option.child_groups?.map((childGroup) => {
                            const childVal = getChildGroupValidation(
                              childGroup,
                              option.id,
                            );
                            const isParentSelected = selectedOptions.includes(
                              option.id,
                            );

                            return (
                              <FormControl
                                key={childGroup.id}
                                component="fieldset"
                                sx={{ width: "100%", mb: 2 }}
                              >
                                <FormLabel
                                  component="legend"
                                  sx={{ mb: 1, color: "text.primary" }}
                                >
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                  >
                                    <Typography
                                      variant="body2"
                                      color="text.primary"
                                    >
                                      {childGroup.name}
                                    </Typography>
                                    {childGroup.min_selection > 0 && (
                                      <Typography
                                        variant="caption"
                                        color={
                                          isParentSelected && childVal.error
                                            ? "error.main"
                                            : "text.secondary"
                                        }
                                      >
                                        ({childGroup.min_selection}
                                        {childGroup.max_selection > 0
                                          ? ` - ${childGroup.max_selection}`
                                          : "+"}{" "}
                                        {t("required")})
                                      </Typography>
                                    )}
                                    {isParentSelected && childVal.error && (
                                      <Typography
                                        variant="caption"
                                        color="error.main"
                                      >
                                        - {childVal.error}
                                      </Typography>
                                    )}
                                  </Stack>
                                </FormLabel>

                                <Stack
                                  spacing={0.5}
                                  sx={{ pl: 1 }}
                                  direction="row"
                                  flexWrap="wrap"
                                >
                                  {childGroup.options.map((childOption) => {
                                    const isChildSelected =
                                      selectedOptions.includes(childOption.id);

                                    return (
                                      <FormControlLabel
                                        key={childOption.id}
                                        control={
                                          <Checkbox
                                            checked={isChildSelected}
                                            onChange={() =>
                                              handleOptionToggle(
                                                childOption.id,
                                                childGroup,
                                              )
                                            }
                                          />
                                        }
                                        label={
                                          <Stack
                                            direction="row"
                                            alignItems="center"
                                            spacing={1}
                                          >
                                            <Typography variant="body2">
                                              {childOption.name}
                                            </Typography>
                                            {childOption.price &&
                                              parseFloat(childOption.price) !==
                                                0 && (
                                                <Typography
                                                  variant="caption"
                                                  color="primary"
                                                  sx={{ fontWeight: 600 }}
                                                >
                                                  +{currency(childOption.price)}
                                                </Typography>
                                              )}
                                            {childOption.is_default && (
                                              <Typography
                                                variant="caption"
                                                color="text.secondary"
                                              >
                                                ({t("default")})
                                              </Typography>
                                            )}
                                          </Stack>
                                        }
                                      />
                                    );
                                  })}
                                </Stack>
                              </FormControl>
                            );
                          })}
                        </Box>
                      </Collapse>
                    )}
                  </Box>
                );
              })}
            </Stack>
          </FormControl>
        );
      })}
    </Stack>
  );
}
