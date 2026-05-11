import { create } from "zustand";

import { CartProduct } from "@/contexts/cart-store";

import { FullProduct } from "@/types/products";

interface ProductFormState {
  product: FullProduct;
  cartProduct: CartProduct | null;
  selectedOptions: string[];
  loading: boolean;

  quantity: number;
  unitPrice: number;
  optionsPrice: number;
  totalPrice: number;
}

interface ProductFormActions {
  setProduct: (product: FullProduct) => void;
  setCartProduct: (cartProduct: CartProduct | null) => void;
  setSelectedOptions: (options: string[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useProductFormStore = create<
  ProductFormState & ProductFormActions
>((set) => ({
  product: {} as FullProduct,
  cartProduct: null,
  selectedOptions: [],
  loading: false,
  quantity: 1,
  unitPrice: 0,
  optionsPrice: 0,
  totalPrice: 0,

  setProduct: (product) => set({ product }),
  setCartProduct: (cartProduct) => {
    set({ cartProduct });
  },
  setSelectedOptions: (selectedOptions) => set({ selectedOptions }),
  setLoading: (loading) => set({ loading }),
}));
