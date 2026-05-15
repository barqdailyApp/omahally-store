"use server";

import { Box } from "@mui/material";

import StoreHeader from "./header";
import Footer from "../common/footer";
import { HEADER } from "../config-layout";
import Copyrights from "../common/copyrights";

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
  logo?: string;
  isAddressRequired?: boolean;
};

export default async function StoreLayout({ children, logo, isAddressRequired }: Props) {
  return (
    <>
      <StoreHeader logo={logo} isAddressRequired={isAddressRequired} />
      <Box
        sx={{
          display: "grid",
          gridTemplateRows: "1fr auto",
          gridTemplateColumns: "100%",
          pt: `${HEADER.H_MOBILE}px`,
          minHeight: "100%",
          overflow: "hidden",
          width: "100%",
        }}
      >
        <Box>{children}</Box>
        <Box sx={{ flexShrink: 0 }}>
          <Footer />
          <Copyrights />
        </Box>
      </Box>
    </>
  );
}
