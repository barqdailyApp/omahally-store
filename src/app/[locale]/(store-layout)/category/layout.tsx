import { ReactNode } from "react";

import { Stack, Container } from "@mui/material";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Stack spacing={2} minHeight="100%" component={Container}>
      {children}
    </Stack>
  );
}
