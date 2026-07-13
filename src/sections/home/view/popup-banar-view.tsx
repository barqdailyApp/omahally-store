import { fetchPopupBanar } from "@/actions/banars-actions";

import PopupBanar from "../popup-banar";

export default async function PopupBanarView() {
  const banarRes = await fetchPopupBanar();

  if (!banarRes || "error" in banarRes) {
    return null;
  }

  return <PopupBanar banar={banarRes} />;
}
