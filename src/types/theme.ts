import { Currency } from "./currency";

export interface AppTheme {
  currency?: Currency;
  theme: {
    logo: string;
    name: string;
    splash_screen: string;
    primary_color: string;
    secondary_color: string;
    show_offer: boolean;
    order_again: boolean;
    is_address_required: boolean;
    unified_contact_phone: string;
    mobile_contact_phone: string;
    whatsapp_number: string;
    email: string;
    app_store_link: string;
    play_store_link: string;
    is_verified: boolean;
    mada: boolean;
    apple_pay: boolean;
    tabby: boolean;
    card_payments: boolean;
    tamara: boolean;
  };
}
