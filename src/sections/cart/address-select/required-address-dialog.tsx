import { Dialog } from "@mui/material";

import NewEditAddressForm from "./new-edit-address-form";

interface Props {
  open: boolean;
}

export default function RequiredAddressDialog({ open }: Props) {
  return (
    <Dialog open={open} fullWidth maxWidth="sm" disableEscapeKeyDown>
      <NewEditAddressForm
        address={null}
        onClose={() => {}}
        onSuccess={() => window.location.reload()}
      />
    </Dialog>
  );
}
