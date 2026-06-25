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
  let appName: string | undefined;
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
  let vatNumber: string | null | undefined;
  let commercialRegistrationNumber: string | null | undefined;
  let isVerified: boolean | undefined;
  let paymentMethods: {
    mada?: boolean;
    apple_pay?: boolean;
    tabby?: boolean;
    card_payments?: boolean;
    tamara?: boolean;
  } = {};
  if (!("error" in theme)) {
    const {
      theme: {
        name,
        logo: resLogo,
        is_address_required,
        unified_contact_phone,
        mobile_contact_phone,
        whatsapp_number,
        email: resEmail,
        app_store_link,
        play_store_link,
        mada,
        apple_pay,
        tabby,
        card_payments,
        tamara,
        vat_number,
        commercial_registration_number,
        is_verified,
      },
      currency,
    } = theme.data;
    appName = name;
    logo = resLogo;
    guestCurrencyCode = currency?.code || null;
    isAddressRequired = is_address_required ?? true;
    unifiedContactPhone = unified_contact_phone;
    mobileContactPhone = mobile_contact_phone;
    whatsappNumber = whatsapp_number;
    email = resEmail;
    appStoreLink = app_store_link;
    playStoreLink = play_store_link;
    vatNumber = vat_number;
    commercialRegistrationNumber = commercial_registration_number;
    isVerified = is_verified;
    paymentMethods = { mada, apple_pay, tabby, card_payments, tamara };
  }

  const favAddress = await getFavAddress();

  return (
    <StoreLayout
      appName={appName}
      logo={logo}
      isAddressRequired={isAddressRequired}
      unifiedContactPhone={unifiedContactPhone}
      mobileContactPhone={mobileContactPhone}
      whatsappNumber={whatsappNumber}
      email={email}
      appStoreLink={appStoreLink}
      playStoreLink={playStoreLink}
      paymentMethods={paymentMethods}
      vatNumber={vatNumber}
      commercialRegistrationNumber={commercialRegistrationNumber}
      isVerified={isVerified}
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
