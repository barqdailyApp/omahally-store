"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie, setCookie } from "cookies-next";

import { Box, Dialog, IconButton, DialogContent } from "@mui/material";

import { getBanarHref } from "@/utils/get-banar-href";

import { COOKIES_KEYS } from "@/config-global";

import Iconify from "@/components/iconify";

import { Banar } from "@/types/banars";

interface Props {
  banar: Banar;
}

export default function PopupBanar({ banar }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(
    () => getCookie(COOKIES_KEYS.popupBanarSeen) !== banar.id,
  );

  const handleClose = () => {
    setOpen(false);
    // no maxAge -> session cookie, cleared when the browser closes
    setCookie(COOKIES_KEYS.popupBanarSeen, banar.id);
  };

  const href = getBanarHref(banar);

  const handleImageClick = () => {
    handleClose();
    if (href) router.push(href);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ p: 0, lineHeight: 0, position: "relative" }}>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            top: 8,
            insetInlineEnd: 8,
            zIndex: 1,
            bgcolor: "rgba(0, 0, 0, 0.48)",
            color: "common.white",
            "&:hover": {
              bgcolor: "rgba(0, 0, 0, 0.64)",
            },
          }}
        >
          <Iconify icon="eva:close-outline" width={20} />
        </IconButton>

        <Box
          onClick={handleImageClick}
          sx={{ cursor: href ? "pointer" : "default" }}
        >
          <Image
            src={banar.banar}
            alt=" "
            width={700}
            height={700}
            style={{
              width: "100%",
              height: "auto",
              aspectRatio: "1/1",
              objectFit: "contain",
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
}
