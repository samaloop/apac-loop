"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  PayPalScriptProvider,
  PayPalButtons,
  type ReactPayPalScriptOptions,
} from "@paypal/react-paypal-js";
import {
  paymentMethods,
  calculateFee,
  calculateTotal,
  type PaymentMethod,
} from "@/app/data/fees";
import { MAX_TICKETS_PER_ORDER } from "@/lib/validation";

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
  components: "buttons",
};

// This whole form intentionally does NOT follow the site's dark mode — it's
// always a fixed light theme. Payment UI needs guaranteed, unambiguous
// contrast, so fixed colors here sidestep any dark-mode contrast issues
// entirely instead of chasing individual bugs.
const INK = "#241c15";
const INK_MUTED = "#6b6250";
const PANEL_BG = "#ffffff";
const SOFT_BG = "#f1e7d3";
const BORDER = "#e4dac4";

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

function ticketMissingFields(ticket: FormState): string[] {
  return fields
    .filter(({ key }) =>
      key === "email" ? !EMAIL_PATTERN.test(ticket.email.trim()) : ticket[key].trim() === ""
    )
    .map(({ label }) => label);
}

const xenditMethods = paymentMethods.filter((method) => method.provider === "xendit");
const paypalMethods = paymentMethods.filter((method) => method.provider === "paypal");

function ErrorNotice({ children }: { children: ReactNode }) {
  return (
    <p
      className="rounded-2xl px-4 py-3 text-sm font-medium"
      style={{ backgroundColor: "#c75b391a", color: "#c75b39" }}
    >
      {children}
    </p>
  );
}

async function createPayPalOrder(methodId: string, tickets: FormState[]): Promise<string> {
  const response = await fetch("/api/paypal/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method: methodId, tickets }),
  });
  const data = (await response.json()) as { id?: string; error?: string };
  if (!data.id) {
    throw new Error(data.error ?? "Failed to create order");
  }
  return data.id;
}

export default function RegistrationForm() {
  const router = useRouter();
  const [tickets, setTickets] = useState<FormState[]>([{ ...EMPTY_FORM }]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [xenditLoading, setXenditLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const invalidAttendees = tickets
    .map((ticket, index) => ({ index, missing: ticketMissingFields(ticket) }))
    .filter(({ missing }) => missing.length > 0);
  const isValid = invalidAttendees.length === 0;

  function updateTicketField(index: number, key: keyof FormState, value: string) {
    setTickets((current) =>
      current.map((ticket, i) => (i === index ? { ...ticket, [key]: value } : ticket))
    );
  }

  function addTicket() {
    setTickets((current) =>
      current.length < MAX_TICKETS_PER_ORDER ? [...current, { ...EMPTY_FORM }] : current
    );
  }

  function removeTicket() {
    setTickets((current) => (current.length > 1 ? current.slice(0, -1) : current));
  }

  async function capturePayment(orderID: string) {
    setSubmitting(true);
    try {
      const response = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderID, tickets }),
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
        body: JSON.stringify({ tickets, method: selectedMethod.id }),
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
    <div
      className="flex flex-col gap-8 rounded-3xl border p-6 sm:p-8"
      style={{ backgroundColor: PANEL_BG, borderColor: BORDER }}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold" style={{ color: INK }}>
            Number of tickets
          </p>
          <p className="text-xs" style={{ color: INK_MUTED }}>
            Up to {MAX_TICKETS_PER_ORDER} per order
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={removeTicket}
            disabled={tickets.length <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-full border text-lg font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderColor: BORDER, color: INK }}
            aria-label="Remove a ticket"
          >
            −
          </button>
          <span className="w-6 text-center text-lg font-semibold" style={{ color: INK }}>
            {tickets.length}
          </span>
          <button
            type="button"
            onClick={addTicket}
            disabled={tickets.length >= MAX_TICKETS_PER_ORDER}
            className="flex h-9 w-9 items-center justify-center rounded-full border text-lg font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderColor: BORDER, color: INK }}
            aria-label="Add a ticket"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {tickets.map((ticket, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 rounded-2xl border p-4"
            style={{ borderColor: BORDER }}
          >
            <p className="text-sm font-semibold" style={{ color: INK }}>
              Attendee {index + 1}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fields.map(({ key, label, type }) => (
                <label key={key} className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium" style={{ color: INK }}>
                    {label} <span style={{ color: "#c75b39" }}>*</span>
                  </span>
                  <input
                    type={type}
                    value={ticket[key]}
                    onChange={(event) => updateTicketField(index, key, event.target.value)}
                    required
                    className="rounded-2xl border px-4 py-2.5 outline-none transition-colors focus:border-[#c75b39]"
                    style={{ backgroundColor: PANEL_BG, borderColor: BORDER, color: INK }}
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && <ErrorNotice>{error}</ErrorNotice>}

      {!showPayment && (
        <div className="flex flex-col gap-3">
          {!isValid && (
            <p className="text-sm" style={{ color: INK_MUTED }}>
              Fill in required fields for{" "}
              {invalidAttendees.map(({ index }) => `Attendee ${index + 1}`).join(", ")} to
              continue to payment.
            </p>
          )}
          <button
            type="button"
            disabled={!isValid}
            onClick={() => setShowPayment(true)}
            className="flex h-12 items-center justify-center rounded-full px-8 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: "#c75b39" }}
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
            quantity={tickets.length}
            selectedId={selectedMethod?.id ?? null}
            onSelect={setSelectedMethod}
          />
          <PaymentMethodGroup
            title="Pay with PayPal"
            methods={paypalMethods}
            quantity={tickets.length}
            selectedId={selectedMethod?.id ?? null}
            onSelect={setSelectedMethod}
          />

          {selectedMethod && (
            <div className="rounded-2xl p-5" style={{ backgroundColor: SOFT_BG }}>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: INK_MUTED }}>
                  Ticket price × {tickets.length}
                </span>
                <span style={{ color: INK }}>
                  {formatAmount(
                    basePriceFor(selectedMethod) * tickets.length,
                    selectedMethod.currency
                  )}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span style={{ color: INK_MUTED }}>Payment fee</span>
                <span style={{ color: INK }}>
                  {formatAmount(
                    calculateFee(selectedMethod, basePriceFor(selectedMethod) * tickets.length),
                    selectedMethod.currency
                  )}
                </span>
              </div>
              <div
                className="mt-3 flex items-center justify-between border-t pt-3"
                style={{ borderColor: BORDER }}
              >
                <span className="text-sm font-semibold" style={{ color: INK }}>
                  Total
                </span>
                <span className="text-lg font-bold" style={{ color: "#c75b39" }}>
                  {formatAmount(
                    calculateTotal(selectedMethod, basePriceFor(selectedMethod) * tickets.length),
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
              className="flex h-12 items-center justify-center rounded-full px-8 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: "#c75b39" }}
            >
              {xenditLoading ? "Redirecting…" : "Pay Now"}
            </button>
          )}

          {selectedMethod?.provider === "paypal" && (
            <PayPalScriptProvider options={paypalOptions}>
              <PayPalButtons
                disabled={submitting}
                style={{ layout: "vertical", color: "gold", shape: "pill" }}
                createOrder={() => {
                  setError(null);
                  return createPayPalOrder(selectedMethod.id, tickets);
                }}
                onApprove={(data) => capturePayment(data.orderID)}
                onError={handlePaymentError}
              />
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
  quantity,
  selectedId,
  onSelect,
}: {
  title: string;
  methods: PaymentMethod[];
  quantity: number;
  selectedId: string | null;
  onSelect: (method: PaymentMethod) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: INK_MUTED }}>
        {title}
      </p>
      <div className="flex flex-col gap-2">
        {methods.map((method) => {
          const isSelected = selectedId === method.id;
          const fee = calculateFee(method, basePriceFor(method) * quantity);
          return (
            <label
              key={method.id}
              className="flex cursor-pointer flex-col gap-2 rounded-2xl border px-4 py-3 transition-colors"
              style={{
                borderColor: isSelected ? "#c75b39" : BORDER,
                backgroundColor: isSelected ? "#c75b390d" : PANEL_BG,
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment-method"
                    checked={isSelected}
                    onChange={() => onSelect(method)}
                    className="h-4 w-4 accent-[#c75b39]"
                  />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: INK }}>
                      {method.label}
                    </p>
                    <p className="text-xs" style={{ color: INK_MUTED }}>
                      {method.description}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-medium" style={{ color: INK_MUTED }}>
                  +{formatAmount(fee, method.currency)}
                </span>
              </div>
              {(method.badges || method.cardNetworks) && (
                <div className="flex flex-wrap items-center gap-1.5 pl-7">
                  {method.badges?.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                      style={{ backgroundColor: SOFT_BG, color: INK_MUTED }}
                    >
                      {badge}
                    </span>
                  ))}
                  {method.cardNetworks && (
                    <>
                      <Image src="/images/cards/visa.svg" alt="Visa" width={28} height={18} className="h-4.5 w-auto" />
                      <Image src="/images/cards/mastercard.svg" alt="Mastercard" width={24} height={18} className="h-4.5 w-auto" />
                      <Image src="/images/cards/jcb.svg" alt="JCB" width={24} height={18} className="h-4.5 w-auto" />
                    </>
                  )}
                </div>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}
