import StoreLayout from "@/layouts/store";
import { getAppTheme } from "@/actions/theme";
import { getFavAddress } from "@/actions/auth-methods";

import GuestGate from "@/components/guest-gate/guest-gate";
import GuestCurrencySync from "@/components/guest-gate/guest-currency-sync";

export default async function Layout({
  children,
  initcart,
  noguest,
}: {
  children: React.ReactNode;
  initcart: React.ReactNode;
  noguest: React.ReactNode;
}) {
  let logo: string | undefined;
  const theme = await getAppTheme();
  let guestCurrencyCode: string | null = null;
  let isAddressRequired = true;
  let unifiedContactPhone: string | undefined;
  let mobileContactPhone: string | undefined;
  let whatsappNumber: string | undefined;
  let email: string | undefined;
  let appStoreLink: string | undefined;
  let playStoreLink: string | undefined;
  if (!("error" in theme)) {
    const {
      theme: {
        logo: resLogo,
        is_address_required,
        unified_contact_phone,
        mobile_contact_phone,
        whatsapp_number,
        email: resEmail,
        app_store_link,
        play_store_link,
      },
      currency,
    } = theme.data;
    logo = resLogo;
    guestCurrencyCode = currency?.code || null;
    isAddressRequired = is_address_required ?? true;
    unifiedContactPhone = unified_contact_phone;
    mobileContactPhone = mobile_contact_phone;
    whatsappNumber = whatsapp_number;
    email = resEmail;
    appStoreLink = app_store_link;
    playStoreLink = play_store_link;
  }

  const favAddress = await getFavAddress();

  return (
    <StoreLayout
      logo={logo}
      isAddressRequired={isAddressRequired}
      unifiedContactPhone={unifiedContactPhone}
      mobileContactPhone={mobileContactPhone}
      whatsappNumber={whatsappNumber}
      email={email}
      appStoreLink={appStoreLink}
      playStoreLink={playStoreLink}
    >
      <GuestCurrencySync currencyCode={guestCurrencyCode} />
      <GuestGate
        forceOpen={!favAddress || !guestCurrencyCode}
        noWarehouseNear={!!favAddress && !guestCurrencyCode}
        chooseWarehouse={!isAddressRequired}
      >
        {children}
        {initcart}
        {noguest}
      </GuestGate>
    </StoreLayout>
  );
}
