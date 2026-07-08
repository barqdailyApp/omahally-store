"use client";

import { useRef, useState, useEffect, useCallback } from "react";

import { alpha } from "@mui/material/styles";
import { Box, Stack, IconButton } from "@mui/material";

import { LeftIcon, RightIcon } from "@/components/carousel/arrow-icons";

interface Props {
  children: React.ReactNode;
  isRTL: boolean;
}

export default function ScrollableRow({ children, isRTL }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 1) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }

    const absScrollLeft = Math.abs(el.scrollLeft);
    setCanScrollPrev(absScrollLeft > 1);
    setCanScrollNext(absScrollLeft < maxScroll - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;

    updateScrollState();

    el.addEventListener("scroll", updateScrollState, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, [updateScrollState, children]);

  const scroll = (forward: boolean) => {
    const el = scrollRef.current;
    if (!el) return;

    const amount = el.clientWidth * 0.6;
    const sign = isRTL ? -1 : 1;
    el.scrollBy({ left: (forward ? amount : -amount) * sign, behavior: "smooth" });
  };

  const arrowButtonSx = {
    flexShrink: 0,
    width: 36,
    height: 36,
    backgroundColor: (theme: any) => alpha(theme.palette.grey[500], 0.08),
    "&:hover": {
      backgroundColor: (theme: any) => alpha(theme.palette.grey[500], 0.16),
    },
  };

  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      {canScrollPrev && (
        <IconButton
          size="small"
          aria-label="scroll-prev"
          onClick={() => scroll(false)}
          sx={arrowButtonSx}
        >
          <LeftIcon isRTL={isRTL} />
        </IconButton>
      )}

      <Box
        ref={scrollRef}
        sx={{
          display: "flex",
          overflowX: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          minWidth: 0,
          flex: "1 1 auto",
        }}
      >
        {children}
      </Box>

      {canScrollNext && (
        <IconButton
          size="small"
          aria-label="scroll-next"
          onClick={() => scroll(true)}
          sx={arrowButtonSx}
        >
          <RightIcon isRTL={isRTL} />
        </IconButton>
      )}
    </Stack>
  );
}
