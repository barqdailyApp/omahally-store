import { create } from "zustand";

export interface CartProduct {
  id: string;
  product_id: string;
  name: string;
  section_id: string;
  description: string;
  product_price: number;
  hidden_options_price: number;
  options_price: number;
  price: number;
  quantity: number;
  unit: string;
  unit_id: string;
  min_order_quantity: number;
  max_order_quantity: number;
  warehouse_quantity: number;
  offer_description: string;
  additional_services: any[];
  image: string;
  options?: { id: string; price: number; name: string }[];
  product_option_groups: CartItemOptionsGroup[];
}

export interface CartItemOptionsGroup {
  id: string;
  option_group_id: string;
  name: string;
  name_en: string;
  min_selection: number;
  max_selection: number;
  show_price: boolean;
  order_by: number;
  options: Option[];
}

export interface Option {
  id: string;
  option_id: string;
  name: string;
  name_en: string;
  price: string;
  is_default: boolean;
  is_selected: boolean;
  order_by: number;
  child_groups?: CartItemOptionsGroup[];
}

export interface PromoCode {
  id: string;
  code: string;
  discount: number;
}

interface InitialState {
  promocode: PromoCode | null;
  products: CartProduct[];
  productsQuantity: number;
  totalPrice: number;
  minOrderPrice: number;
  deliveryFee: number;
}

interface CartStateActions {
  initCart: VoidFunction;
  setPromocode: (promocode: PromoCode | null) => void;
  setProduct: (product: CartProduct) => void;
  removeProduct: (id: string) => void;
  initProducts: (products: CartProduct[]) => void;
  setMinOrderPrice: (price: number) => void;
  setDeliveryFee: (fee: number) => void;
}

const initialState: InitialState = {
  promocode: null,
  products: [],
  productsQuantity: 0,
  totalPrice: 0,
  minOrderPrice: 0,
  deliveryFee: 0,
};

export const useCartStore = create<InitialState & CartStateActions>()(
  (set) => ({
    ...initialState,
    initCart: () => set({ ...initialState }),
    setPromocode: (promocode) => set({ promocode }),
    setProduct: (newProduct) =>
      set((state) => {
        let isProductExist = false;
        let priceDiff = 0;

        const updatedProducts = state.products.map((product) => {
          if (product.id === newProduct.id) {
            isProductExist = true;
            priceDiff = newProduct.price - product.price;
            return { ...product, ...newProduct };
          }
          return product;
        });

        return {
          ...(isProductExist
            ? {
                products: updatedProducts,
                totalPrice: state.totalPrice + priceDiff,
              }
            : {
                products: [...updatedProducts, newProduct],
                productsQuantity: state.productsQuantity + 1,
                totalPrice:
                  state.totalPrice + newProduct.price * newProduct.quantity,
              }),
        };
      }),
    removeProduct: (id) =>
      set((state) => {
        const oldProduct = state.products.find((product) => product.id === id);

        return {
          products: state.products.filter((product) => product.id !== id),
          productsQuantity: state.productsQuantity - 1,
          totalPrice: state.totalPrice - (oldProduct?.price || 0),
        };
      }),
    initProducts: (products) => {
      set({
        products,
        productsQuantity: products.length,
        totalPrice: products.reduce((acc, product) => acc + product.price, 0),
      });
    },
    setMinOrderPrice: (price) => set({ minOrderPrice: price }),
    setDeliveryFee: (fee) => set({ deliveryFee: fee }),
  }),
);
