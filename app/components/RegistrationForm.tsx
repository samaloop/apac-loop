"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PayPalScriptProvider,
  PayPalButtons,
  PayPalCardFieldsProvider,
  PayPalNameField,
  PayPalNumberField,
  PayPalExpiryField,
  PayPalCVVField,
  usePayPalCardFields,
  type ReactPayPalScriptOptions,
} from "@paypal/react-paypal-js";
import {
  paymentMethods,
  calculateFee,
  calculateTotal,
  type PaymentMethod,
} from "@/app/data/fees";

type FormState = {
  name: string;
  email: string;
  phone: string;
  country: string;
  company: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  country: "",
  company: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fields: { key: keyof FormState; label: string; type: string }[] = [
  { key: "name", label: "Full name", type: "text" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone number", type: "tel" },
  { key: "country", label: "Country", type: "text" },
  { key: "company", label: "Company", type: "text" },
];

const paypalOptions: ReactPayPalScriptOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "",
  currency: "USD",
  intent: "capture",
  components: "buttons,card-fields",
};

// Card fields render inside cross-origin PayPal iframes, so their text can't
// follow the site's dark mode — keep this readable against the fixed light
// wrapper background used below.
const cardFieldStyle = {
  input: {
    "font-size": "15px",
    color: "#1a1a1a",
    "font-family": "inherit",
  },
};

const BASE_PRICE_IDR = Number(process.env.NEXT_PUBLIC_TICKET_PRICE_IDR ?? 0);
const BASE_PRICE_USD = Number(process.env.NEXT_PUBLIC_TICKET_PRICE_USD ?? 0);

function basePriceFor(method: PaymentMethod): number {
  return method.currency === "IDR" ? BASE_PRICE_IDR : BASE_PRICE_USD;
}

function formatAmount(amount: number, currency: "IDR" | "USD"): string {
  if (currency === "IDR") {
    return `Rp ${Math.round(amount).toLocaleString("id-ID")}`;
  }
  return `$${amount.toFixed(2)}`;
}

const xenditMethods = paymentMethods.filter((method) => method.provider === "xendit");
const paypalMethods = paymentMethods.filter((method) => method.provider === "paypal");

async function createPayPalOrder(methodId: string): Promise<string> {
  const response = await fetch("/api/paypal/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method: methodId }),
  });
  const data = (await response.json()) as { id?: string; error?: string };
  if (!data.id) {
    throw new Error(data.error ?? "Failed to create order");
  }
  return data.id;
}

export default function RegistrationForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [xenditLoading, setXenditLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const missingFields = fields
    .filter(({ key }) =>
      key === "email" ? !EMAIL_PATTERN.test(form.email.trim()) : form[key].trim() === ""
    )
    .map(({ label }) => label);
  const isValid = missingFields.length === 0;

  async function capturePayment(orderID: string) {
    setSubmitting(true);
    try {
      const response = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderID, ...form }),
      });
      const result = (await response.json()) as { success: boolean; error?: string };
      if (!result.success) {
        setError(result.error ?? "Payment could not be completed.");
        setSubmitting(false);
        return;
      }
      router.push("/register/success");
    } catch {
      setError("Something went wrong confirming your payment. Please try again.");
      setSubmitting(false);
    }
  }

  function handlePaymentError() {
    setError("PayPal ran into a problem. Please try again.");
    setSubmitting(false);
  }

  async function payWithXendit() {
    if (!selectedMethod) return;
    setError(null);
    setXenditLoading(true);
    try {
      const response = await fetch("/api/xendit/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, method: selectedMethod.id }),
      });
      const result = (await response.json()) as { invoiceUrl?: string; error?: string };
      if (!result.invoiceUrl) {
        setError(result.error ?? "Failed to start Xendit payment.");
        setXenditLoading(false);
        return;
      }
      window.location.href = result.invoiceUrl;
    } catch {
      setError("Something went wrong starting Xendit payment. Please try again.");
      setXenditLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 rounded-3xl border border-black/[.08] bg-background p-6 dark:border-white/[.145] dark:bg-[#241c15] sm:p-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map(({ key, label, type }) => (
          <label key={key} className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">
              {label} <span className="text-accent">*</span>
            </span>
            <input
              type={type}
              value={form[key]}
              onChange={(event) =>
                setForm((current) => ({ ...current, [key]: event.target.value }))
              }
              required
              className="rounded-2xl border border-black/[.08] bg-background px-4 py-2.5 text-foreground outline-none transition-colors focus:border-accent dark:border-white/[.145] dark:bg-[#1c1712]"
            />
          </label>
        ))}
      </div>

      {error && (
        <p className="rounded-2xl bg-accent/10 px-4 py-3 text-sm font-medium text-accent">
          {error}
        </p>
      )}

      {!showPayment && (
        <div className="flex flex-col gap-3">
          {!isValid && (
            <p className="text-sm text-foreground/60">
              Fill in {missingFields.join(", ")} to continue to payment.
            </p>
          )}
          <button
            type="button"
            disabled={!isValid}
            onClick={() => setShowPayment(true)}
            className="flex h-12 items-center justify-center rounded-full bg-accent px-8 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue to Payment
          </button>
        </div>
      )}

      {showPayment && (
        <div className="flex flex-col gap-6">
          <PaymentMethodGroup
            title="Pay with Xendit"
            methods={xenditMethods}
            selectedId={selectedMethod?.id ?? null}
            onSelect={setSelectedMethod}
          />
          <PaymentMethodGroup
            title="Pay with PayPal"
            methods={paypalMethods}
            selectedId={selectedMethod?.id ?? null}
            onSelect={setSelectedMethod}
          />

          {selectedMethod && (
            <div className="rounded-2xl bg-surface-muted p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground/70">Ticket price</span>
                <span className="text-foreground">
                  {formatAmount(basePriceFor(selectedMethod), selectedMethod.currency)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-foreground/70">Payment fee</span>
                <span className="text-foreground">
                  {formatAmount(
                    calculateFee(selectedMethod, basePriceFor(selectedMethod)),
                    selectedMethod.currency
                  )}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-3 dark:border-white/10">
                <span className="text-sm font-semibold text-foreground">Total</span>
                <span className="text-lg font-bold text-accent">
                  {formatAmount(
                    calculateTotal(selectedMethod, basePriceFor(selectedMethod)),
                    selectedMethod.currency
                  )}
                </span>
              </div>
            </div>
          )}

          {selectedMethod?.provider === "xendit" && (
            <button
              type="button"
              disabled={xenditLoading}
              onClick={payWithXendit}
              className="flex h-12 items-center justify-center rounded-full bg-accent px-8 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {xenditLoading ? "Redirecting…" : "Pay Now"}
            </button>
          )}

          {selectedMethod?.provider === "paypal" && (
            <PayPalScriptProvider options={paypalOptions}>
              {selectedMethod.id === "paypal-card" ? (
                <PayPalCardFieldsProvider
                  createOrder={() => {
                    setError(null);
                    return createPayPalOrder(selectedMethod.id);
                  }}
                  onApprove={(data) => capturePayment(data.orderID)}
                  onError={handlePaymentError}
                  style={cardFieldStyle}
                >
                  <CardPaymentFields
                    name={form.name}
                    submitting={submitting}
                    setSubmitting={setSubmitting}
                    setError={setError}
                  />
                </PayPalCardFieldsProvider>
              ) : (
                <PayPalButtons
                  disabled={submitting}
                  style={{ layout: "vertical", color: "gold", shape: "pill" }}
                  createOrder={() => {
                    setError(null);
                    return createPayPalOrder(selectedMethod.id);
                  }}
                  onApprove={(data) => capturePayment(data.orderID)}
                  onError={handlePaymentError}
                />
              )}
            </PayPalScriptProvider>
          )}
        </div>
      )}
    </div>
  );
}

function PaymentMethodGroup({
  title,
  methods,
  selectedId,
  onSelect,
}: {
  title: string;
  methods: PaymentMethod[];
  selectedId: string | null;
  onSelect: (method: PaymentMethod) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold uppercase tracking-wide text-foreground/60">{title}</p>
      <div className="flex flex-col gap-2">
        {methods.map((method) => {
          const isSelected = selectedId === method.id;
          const fee = calculateFee(method, basePriceFor(method));
          return (
            <label
              key={method.id}
              className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border px-4 py-3 transition-colors ${
                isSelected
                  ? "border-accent bg-accent/5"
                  : "border-black/[.08] hover:border-accent/50 dark:border-white/[.145]"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment-method"
                  checked={isSelected}
                  onChange={() => onSelect(method)}
                  className="h-4 w-4 accent-accent"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">{method.label}</p>
                  <p className="text-xs text-foreground/60">{method.description}</p>
                </div>
              </div>
              <span className="shrink-0 text-xs font-medium text-foreground/60">
                +{formatAmount(fee, method.currency)}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

const cardFieldWrapperClass = "rounded-2xl border border-black/[.08] bg-white px-4 py-2.5";

function CardPaymentFields({
  name,
  submitting,
  setSubmitting,
  setError,
}: {
  name: string;
  submitting: boolean;
  setSubmitting: (value: boolean) => void;
  setError: (value: string | null) => void;
}) {
  const { cardFieldsForm } = usePayPalCardFields();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (cardFieldsForm) return;
    const timer = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(timer);
  }, [cardFieldsForm]);

  if (!cardFieldsForm) {
    if (timedOut) {
      return (
        <p className="rounded-2xl bg-accent/10 px-4 py-3 text-sm font-medium text-accent">
          The payment form couldn&apos;t load. Please refresh the page, or contact us if this
          keeps happening.
        </p>
      );
    }
    return <p className="text-sm text-foreground/60">Loading payment form…</p>;
  }

  if (!cardFieldsForm.isEligible()) {
    return (
      <p className="rounded-2xl bg-accent/10 px-4 py-3 text-sm font-medium text-accent">
        Card payments aren&apos;t available right now. Please contact us to complete your
        registration.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">Name on card</span>
        <div className={cardFieldWrapperClass}>
          <PayPalNameField />
        </div>
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">Card number</span>
        <div className={cardFieldWrapperClass}>
          <PayPalNumberField />
        </div>
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Expiry</span>
          <div className={cardFieldWrapperClass}>
            <PayPalExpiryField />
          </div>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">CVV</span>
          <div className={cardFieldWrapperClass}>
            <PayPalCVVField />
          </div>
        </label>
      </div>
      <button
        type="button"
        disabled={submitting}
        onClick={async () => {
          setError(null);
          setSubmitting(true);
          try {
            await cardFieldsForm.submit({ name });
          } catch {
            setError("Please check your card details and try again.");
            setSubmitting(false);
          }
        }}
        className="flex h-12 items-center justify-center rounded-full bg-accent px-8 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-60"
      >
        Pay with Card
      </button>
    </div>
  );
}
