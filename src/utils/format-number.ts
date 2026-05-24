// ----------------------------------------------------------------------

import { useLocale } from "next-intl";
import { getCookie } from "cookies-next";

import { COOKIES_KEYS } from "@/config-global";
import { LocaleType } from "@/i18n/config-locale";
import { usecheckoutStore } from "@/contexts/checkout-store";
import { useCurrentLocale } from "@/i18n/localization-provider";

/*
 * Locales code
 * https://gist.github.com/raushankrjha/d1c7e35cf87e69aa8b4208a8171a8416
 */

type InputValue = string | number | null;

function getLocaleCode() {
  const {
    numberFormat: { code, currency },
    // eslint-disable-next-line react-hooks/rules-of-hooks
  } = useCurrentLocale();

  return {
    code: code ?? "en-US",
    currency: currency ?? "USD",
  };
}

// ----------------------------------------------------------------------

export function fNumber(inputValue: InputValue) {
  const { code } = getLocaleCode();

  if (!inputValue) return "";

  const number = Number(inputValue);

  const fm = new Intl.NumberFormat(code, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(number);

  return fm;
}

// ----------------------------------------------------------------------

export function fCurrency(inputValue: InputValue) {
  const { code, currency } = getLocaleCode();

  if (!inputValue) return "";

  const number = Number(inputValue);

  const fm = new Intl.NumberFormat(code, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(number);

  return fm;
}

// ----------------------------------------------------------------------

export function useCurrency() {
  const locale = useLocale() as LocaleType;

  const { choosenAddress, choosenCurrency, currencies, isAddressRequired } =
    usecheckoutStore();
  const symbolKey = locale === "en" ? "symbol_en" : "symbol_ar";

  const addressCurrency = currencies.find(
    (currency) => currency.code === choosenAddress?.currency,
  )?.[symbolKey];
  const selectedCurrency = currencies.find(
    (currency) => currency.code === choosenCurrency,
  )?.[symbolKey];
  const warehouseCurrencyCode = getCookie(COOKIES_KEYS.warehouseCurrency) as
    | string
    | undefined;
  const warehouseCurrency = currencies.find(
    (currency) => currency.code === warehouseCurrencyCode,
  )?.[symbolKey];
  const formater = (inputValue: InputValue, currencyCode = true) => {
    const number = Number(inputValue);

    const fm = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);

    if (!currencyCode) return fm;

    let currencyLabel: string;
    if (isAddressRequired) {
      currencyLabel = choosenAddress
        ? addressCurrency || ""
        : selectedCurrency || "";
    } else {
      currencyLabel = warehouseCurrency || "";
    }

    if (!currencyLabel) return fm;

    return `${fm} ${currencyLabel}`;
  };

  return formater;
}

// ----------------------------------------------------------------------

export function fPercent(inputValue: InputValue) {
  const { code } = getLocaleCode();

  if (!inputValue) return "";

  const number = Number(inputValue) / 100;

  const fm = new Intl.NumberFormat(code, {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(number);

  return fm;
}

// ----------------------------------------------------------------------

export function fShortenNumber(inputValue: InputValue) {
  const { code } = getLocaleCode();

  if (!inputValue) return "";

  const number = Number(inputValue);

  const fm = new Intl.NumberFormat(code, {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(number);

  return fm.replace(/[A-Z]/g, (match) => match.toLowerCase());
}

// ----------------------------------------------------------------------

export function fData(inputValue: InputValue) {
  if (!inputValue) return "";

  if (inputValue === 0) return "0 Bytes";

  const units = ["bytes", "Kb", "Mb", "Gb", "Tb", "Pb", "Eb", "Zb", "Yb"];

  const decimal = 2;

  const baseValue = 1024;

  const number = Number(inputValue);

  const index = Math.floor(Math.log(number) / Math.log(baseValue));

  const fm = `${parseFloat((number / baseValue ** index).toFixed(decimal))} ${units[index]}`;

  return fm;
}
