export const endpoints = {
  theme: "section/home",
  auth: {
    sendOtp: "auth/send-otp",
    verifyOtp: "auth/verify-otp",
    register: "auth/register",
  },
  users: {
    getProfile: "users/get-profile",
  },
  products: {
    sections: "section",
    categories: (sectionId: string) => `section/${sectionId}/categories`,
    categoryGroups: "section/client/section-category-group",
    subCategories: (categoryId: string) =>
      `category/${categoryId}/subcategories`,
    products: "product/all-products-for-client",
    favoriteList: "product/all-Product-favorite",
    singleProduct: "product/single-product-client",
    brands: "product/get-brands-client",
    offers: "product/all-products-offers-for-client",
    collections: "product/get-collections",
    favorite: ({
      productId,
      sectionId,
    }: {
      productId: string;
      sectionId: string;
    }) => `product/product-favorite/${productId}/${sectionId}`,
  },
  cart: {
    fetchProducts: "cart",
    fetchProductById: (cart_product_id: string) => `cart/${cart_product_id}`,
    add: "cart/add",
    delete: (cart_product_id: string) => `cart/delete/${cart_product_id}`,
    update: "cart/update/{cart}-product",
    updateOptions: "cart/update-options",
    timeSlots: (delivery_day: string) => `slot/${delivery_day}/all-slots`,
    listPayments: "payment-method",
    fetchPromoCode: (code: string, paymentMethodId: string) =>
      `promo-code/valid/{id}?code=${code}&payment_method_id=${paymentMethodId}`,
    createOrder: "order",
  },
  staticPage: {
    root: (static_page_type: string) => `static-page/${static_page_type}`,
  },
  address: {
    root: "addresses",
    delete: (id: string) => `addresses/${id}`,
    setFavorite: (id: string) => `addresses/${id}/set-favorite`,
  },
  wallet: "transaction/wallet",
  currency: {
    list: "currency",
  },
  banars: "banar/guest",
  orders: {
    single: (order_id: string) => `order/single-order/${order_id}`,
    list: "order/client-orders",
    shipment: (shipment_id: string) => `order/single-shipment/${shipment_id}`,
    addFeedback: "shipment/add-shipment-feedback",
    reasons: (type: string) => `reason/all?type=${type}`,
    cancel: (shipment_id: string) => `shipment/cancel-shipment/${shipment_id}`,
    return: (order_id: string) => `order/return-order/${order_id}`,
  },
};
