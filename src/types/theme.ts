import { Currency } from "./currency";

export interface AppTheme {
  currency?: Currency;
  theme: {
    logo: string;
    name: string;
    splash_screen: string;
    primary_color: string;
    secondary_color: string;
    show_offers: boolean;
    order_again: boolean;
  };
}
