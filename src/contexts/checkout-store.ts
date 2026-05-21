import { create } from "zustand";

import { saveFavAddress } from "@/actions/auth-methods";

import { Currency } from "@/types/currency";
import { FullAddress } from "@/types/profile";
import { Payment, TimeSlot } from "@/types/cart";

import { useCartStore } from "./cart-store";

type DeliveryType = "FAST" | "WAREHOUSE_PICKUP" | "SCHEDULED";

interface PaymentForm {
  transaction_number?: string;
  notes: string;
  terms?: boolean;
}

interface InitialState {
  step: number;

  deliveryTypes: DeliveryType[];
  choosenDeliveryType: DeliveryType | null;

  addresses: FullAddress[];
  choosenAddress: FullAddress | null;

  currencies: Currency[];
  choosenCurrency: string | null;

  day: Date;

  timeSlot: TimeSlot | null;

  payments: Payment[];

  choosenPayment: Payment | null;

  walletDiscount: number;

  paymentForm: PaymentForm;

  orderId: string | null;

  warehouseId: string | null;
  taxRate: string | null;

  isDigital: boolean;
}

interface CheckoutStateActions {
  initCheckout: VoidFunction;

  setStep: (step: number | ((prev: number) => number)) => void;

  setDeliveryTypes: (deliveryTypes: DeliveryType[]) => void;
  setChoosenDeliveryType: (deliveryType: DeliveryType | null) => void;

  setAddresses: (
    addresses: FullAddress[] | ((prev: FullAddress[]) => FullAddress[]),
  ) => void;
  setChoosenAddress: (address: FullAddress | null) => void;

  setCurrencies: (currencies: Currency[]) => void;
  setChoosenCurrency: (currency: string | null) => void;

  setDay: (day: Date) => void;
  setTimeSlot: (timeSlot: TimeSlot | null) => void;

  setPayments: (payments: Payment[]) => void;
  setChoosenPayment: (payment: Payment | null) => void;

  setWalletDiscount: (walletDiscount: number) => void;

  setPaymentForm: (
    paymentForm: PaymentForm | ((prev: PaymentForm) => PaymentForm),
  ) => void;

  setOrderId: (orderId: string | null) => void;

  setWarehouseId: (warehouseId: string | null) => void;
  setTaxRate: (taxRate: string | null) => void;

  setIsDigital: (is_digital: boolean) => void;
}

const initialState: InitialState = {
  step: 0,

  deliveryTypes: [],
  choosenDeliveryType: null,

  addresses: [],
  choosenAddress: null,

  currencies: [],
  choosenCurrency: null,

  day: new Date(),

  timeSlot: null,

  payments: [],

  choosenPayment: null,

  walletDiscount: 0,

  paymentForm: { notes: "" },

  orderId: null,

  warehouseId: null,
  taxRate: null,

  isDigital: false,
};

export const usecheckoutStore = create<InitialState & CheckoutStateActions>()(
  (set, get) => ({
    ...initialState,
    initCheckout: () => set({ ...initialState }),
    setStep: (step) =>
      set((state) => ({
        step: typeof step === "number" ? step : step(state.step),
      })),
    setDeliveryTypes: (deliveryTypes) =>
      set(() => ({
        deliveryTypes,
        choosenDeliveryType: deliveryTypes[0],
      })),
    setChoosenDeliveryType: (deliveryType) =>
      set(() => ({ choosenDeliveryType: deliveryType })),
    setAddresses: (addresses) => {
      const state = get();
      const newAddresses =
        typeof addresses === "function"
          ? addresses(state.addresses)
          : addresses;
      const favAddress = newAddresses.find((address) => address.is_favorite);
      const choosenAddress = state.choosenAddress || newAddresses[0];
      if (favAddress) {
        saveFavAddress(favAddress);
        useCartStore.setState({
          minOrderPrice: choosenAddress.min_order_price,
          deliveryFee: choosenAddress.delivery_price,
        });
      }

      set({
        addresses: newAddresses,
        choosenAddress,
        deliveryTypes: choosenAddress.delivery_type,
      });
    },
    setChoosenAddress: (address) => {
      if (address) {
        saveFavAddress(address);
        useCartStore.setState({
          minOrderPrice: address.min_order_price,
          deliveryFee: address.delivery_price,
        });
      }

      set({
        choosenAddress: address,
        deliveryTypes: address ? address.delivery_type : [],
      });
    },

    setCurrencies: (currencies) => set(() => ({ currencies })),
    setChoosenCurrency: (choosenCurrency) => set(() => ({ choosenCurrency })),

    setDay: (day) => set(() => ({ day })),
    setTimeSlot: (timeSlot) => set(() => ({ timeSlot })),

    setPayments: (payments) => set(() => ({ payments })),
    setChoosenPayment: (payment) => set(() => ({ choosenPayment: payment })),

    setWalletDiscount: (walletDiscount) => set(() => ({ walletDiscount })),

    setPaymentForm: (paymentForm) =>
      set((state) => ({
        paymentForm:
          typeof paymentForm === "function"
            ? paymentForm(state.paymentForm)
            : paymentForm,
      })),

    setOrderId: (orderId) => set(() => ({ orderId })),
    setWarehouseId: (warehouseId) => set(() => ({ warehouseId })),
    setTaxRate: (taxRate) => set(() => ({ taxRate })),
    setIsDigital: (isDigital) => set(() => ({ isDigital })),
  }),
);
