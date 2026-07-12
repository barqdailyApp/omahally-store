"use server";

import { Box } from "@mui/material";

import StoreHeader from "./header";
import { HEADER } from "../config-layout";
import Footer, { FooterProps } from "../common/footer";
import Copyrights, { PaymentMethods } from "../common/copyrights";

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
  logo?: string;
  ticker?: string;
  isAddressRequired?: boolean;
  appName?: string;
  paymentMethods?: PaymentMethods;
  simpleHeader?: boolean;
  vatNumber?: string | null;
  commercialRegistrationNumber?: string | null;
  isVerified?: boolean;
} & FooterProps;

export default async function StoreLayout({
  children,
  logo,
  ticker,
  isAddressRequired,
  appName,
  paymentMethods,
  simpleHeader = false,
  vatNumber,
  commercialRegistrationNumber,
  isVerified,
  ...footerProps
}: Props) {
  const headerHeight = HEADER.H_TOOLBAR + (ticker ? HEADER.H_TICKER : 0);

  return (
    <>
      <StoreHeader
        logo={logo}
        ticker={ticker}
        isAddressRequired={isAddressRequired}
        simpleHeader={simpleHeader}
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateRows: "1fr auto",
          gridTemplateColumns: "100%",
          pt: `${headerHeight}px`,
          minHeight: "100%",
          overflow: "hidden",
          width: "100%",
        }}
      >
        <Box>{children}</Box>
        <Box sx={{ flexShrink: 0 }}>
          <Footer {...footerProps} />
          <Copyrights
            appName={appName}
            paymentMethods={paymentMethods}
            vatNumber={vatNumber}
            commercialRegistrationNumber={commercialRegistrationNumber}
            isVerified={isVerified}
          />
        </Box>
      </Box>
    </>
  );
}
