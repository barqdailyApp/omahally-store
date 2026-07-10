"use client";

import { useState, useEffect, useCallback } from "react";

import { useTheme } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";

import { useQueryString } from "@/hooks/use-queryString";

import ScrollableRow from "@/CustomSharedComponents/scrollable-row";

import { Category } from "@/types/products";

interface Props {
  categories: Category[];
  initialCategoryId: string | undefined;
}

export default function CategoriesFilter({
  categories,
  initialCategoryId,
}: Props) {
  const [categoryId, setCategoryId] = useState(initialCategoryId);

  const { createQueryString } = useQueryString();
  const theme = useTheme();
  const isRTL = theme.direction === "rtl";

  const handleChange = useCallback(
    (newValue: string) => {
      setCategoryId(newValue);
      createQueryString(
        [
          { name: "categoryId", value: newValue },
          { name: "page", value: undefined },
        ],
        true
      );
    },
    [createQueryString]
  );

  useEffect(() => {
    if (
      !initialCategoryId ||
      !categories.find((item) => item.id === categoryId)
    ) {
      handleChange(categories[0].id);
    }
  }, [handleChange, categories, categoryId, initialCategoryId]);

  return (
    <ScrollableRow isRTL={isRTL}>
      {categories.map((item) => {
        const selected = item.id === categoryId;
        return (
          <Box
            key={item.id}
            onClick={() => handleChange(item.id)}
            sx={{
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              p: 1.5,
              width: 92,
              minHeight: 96,
              flexShrink: 0,
              mx: 0.5,
              borderRadius: 2,
              border: "1px solid",
              borderColor: selected ? "primary.main" : "divider",
              backgroundColor: "background.paper",
              transition: (t) =>
                t.transitions.create(["border-color", "box-shadow"]),
              ...(selected && {
                boxShadow: (t) => `0 0 0 1px ${t.palette.primary.main}`,
              }),
            }}
          >
            {item.logo && (
              <Box
                component="img"
                src={item.logo}
                alt={item.name}
                sx={{ width: 40, height: 40, objectFit: "contain" }}
              />
            )}
            <Typography
              variant="caption"
              textAlign="center"
              color={selected ? "primary.main" : "text.primary"}
              sx={{
                maxWidth: "100%",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.3,
              }}
            >
              {item.name}
            </Typography>
          </Box>
        );
      })}
    </ScrollableRow>
  );
}
