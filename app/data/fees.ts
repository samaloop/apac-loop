export type PaymentMethodId =
  | "xendit-va"
  | "xendit-qris"
  | "xendit-ewallet"
  | "xendit-card"
  | "paypal-account";

export type PaymentMethodFee =
  | { type: "flat"; amount: number }
  | { type: "percent"; rate: number; fixed: number };

export type PaymentMethod = {
  id: PaymentMethodId;
  provider: "xendit" | "paypal";
  label: string;
  description: string;
  currency: "IDR" | "USD";
  fee: PaymentMethodFee;
  // Text badges (bank/wallet short names, "QRIS") — no official logo source
  // for these Indonesia-specific brands, so styled text stands in for them.
  badges?: string[];
  // Real network logos (public/images/cards/*.svg) for methods that go
  // through Visa/Mastercard/JCB.
  cardNetworks?: boolean;
};

// Fee figures are Xendit's and PayPal's *public* rate-card numbers (checked
// against their published docs), not this merchant's actual contracted
// rates — correct these against the live Xendit/PayPal dashboards before
// taking real payments.
export const paymentMethods: PaymentMethod[] = [
  {
    id: "xendit-va",
    provider: "xendit",
    label: "Virtual Account / Bank Transfer",
    description: "BCA, BNI, Mandiri, and more",
    currency: "IDR",
    fee: { type: "flat", amount: 13000 },
    badges: ["BCA", "BNI", "Mandiri", "Permata"],
  },
  {
    id: "xendit-qris",
    provider: "xendit",
    label: "QRIS",
    description: "Scan with any e-wallet or mobile banking app",
    currency: "IDR",
    fee: { type: "percent", rate: 0.007, fixed: 4000 },
    badges: ["QRIS"],
  },
  {
    id: "xendit-ewallet",
    provider: "xendit",
    label: "E-Wallet",
    description: "OVO, DANA, ShopeePay, LinkAja (rate varies by wallet)",
    currency: "IDR",
    fee: { type: "percent", rate: 0.03, fixed: 4000 },
    badges: ["OVO", "DANA", "ShopeePay", "LinkAja"],
  },
  {
    id: "xendit-card",
    provider: "xendit",
    label: "Credit/Debit Card",
    description: "Visa, Mastercard, JCB via Xendit",
    currency: "IDR",
    fee: { type: "percent", rate: 0.029, fixed: 6000 },
    cardNetworks: true,
  },
  {
    id: "paypal-account",
    provider: "paypal",
    label: "PayPal",
    description: "Pay with a card or your PayPal balance",
    currency: "USD",
    fee: { type: "percent", rate: 0.044, fixed: 0.3 },
    cardNetworks: true,
  },
];

export function getPaymentMethod(id: string): PaymentMethod | undefined {
  return paymentMethods.find((method) => method.id === id);
}

export function calculateFee(method: PaymentMethod, basePrice: number): number {
  if (method.fee.type === "flat") {
    return method.fee.amount;
  }
  const raw = basePrice * method.fee.rate + method.fee.fixed;
  return method.currency === "IDR" ? Math.round(raw) : Math.round(raw * 100) / 100;
}

export function calculateTotal(method: PaymentMethod, basePrice: number): number {
  return basePrice + calculateFee(method, basePrice);
}
