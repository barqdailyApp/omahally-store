import StoreLayout from "@/layouts/store";
import { getAppTheme } from "@/actions/theme";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  let appName: string | undefined;
  let logo: string | undefined;
  const theme = await getAppTheme();
  let isAddressRequired = true;
  let unifiedContactPhone: string | undefined;
  let mobileContactPhone: string | undefined;
  let whatsappNumber: string | undefined;
  let email: string | undefined;
  let appStoreLink: string | undefined;
  let playStoreLink: string | undefined;
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
      },
    } = theme.data;
    appName = name;
    logo = resLogo;
    isAddressRequired = is_address_required ?? true;
    unifiedContactPhone = unified_contact_phone;
    mobileContactPhone = mobile_contact_phone;
    whatsappNumber = whatsapp_number;
    email = resEmail;
    appStoreLink = app_store_link;
    playStoreLink = play_store_link;
    paymentMethods = { mada, apple_pay, tabby, card_payments, tamara };
  }

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
      simpleHeader
    >
      {children}
    </StoreLayout>
  );
}
