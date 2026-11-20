/** Platform-neutral KUJUK request/response types. Prices in the response are computed on the server. */
export type Currency = 'EGP' | 'SDG';
export type DeliveryCountry = 'Egypt' | 'Sudan';
export type CheckoutItem = { productId: number; quantity: number };
export type DeliveryAddress = { name: string; phone: string; country: DeliveryCountry; city: string; area?: string; address: string; instructions?: string | null };
export type QuoteRequest = { items: CheckoutItem[]; country: DeliveryCountry; currency: Currency; couponCode?: string | null };
export type CheckoutRequest = Omit<QuoteRequest, 'country'> & { customer: DeliveryAddress; paymentMethod: 'cod'; expectedTotal: number };
export type CheckoutQuote = { subtotal: number; discount: number; shipping: number; total: number; currency: Currency; exchangeRate: number; shipments: number };
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
