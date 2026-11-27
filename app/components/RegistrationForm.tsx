"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  getPricingTier,
  tierPriceFor,
  DEFAULT_TIER_ID,
  sgdToIDR,
  formatSGD,
  methodAmountToSGD,
} from "@/app/data/pricing";
import { helpWhatsAppUrl } from "@/app/data/event";
import { promoDiscount, describePromo, type AppliedPromo } from "@/app/data/promo";
import { MAX_TICKETS_PER_ORDER } from "@/lib/validation";
import { countries, DEFAULT_DIAL_COUNTRY } from "@/app/data/countries";

type Attendee = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // ISO code of the country picked in the phone's dialling-code dropdown.
  phoneCountry: string;
  country: string;
  company: string;
  memberId: string;
};

// The design's three ticket options, mapped onto the existing pricing:
// "member" is the member price for one person (Member ID required),
// "general" is one person at the regular price, "group" is 2+ people at the
// regular price on one order.
type TicketKind = "member" | "general" | "group";

const TICKET_OPTIONS: { kind: TicketKind; name: string; audience: string }[] = [
  { kind: "member", name: "APAC Member", audience: "Confirm by logging in to your APAC account" },
  { kind: "general", name: "General Admission", audience: "For coaches, leaders and changemakers" },
  { kind: "group", name: "Group Pass", audience: "For teams learning together" },
];

const STEPS = ["Choose ticket", "Your details", "Review & payment"];

const MIN_GROUP_SIZE = 2;

function emptyAttendee(): Attendee {
  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    phoneCountry: DEFAULT_DIAL_COUNTRY,
    country: "",
    company: "",
    memberId: "",
  };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A phone number needs at least this many digits after the dialling code.
const MIN_PHONE_DIGITS = 6;

function dialCodeFor(countryCode: string): string {
  return countries.find((c) => c.code === countryCode)?.dial ?? "";
}

type FieldKey = Exclude<keyof Attendee, "memberId" | "phoneCountry">;

const fields: { key: FieldKey; label: string; type: string; autoComplete: string }[] = [
  { key: "firstName", label: "First name", type: "text", autoComplete: "given-name" },
  { key: "lastName", label: "Last name", type: "text", autoComplete: "family-name" },
  { key: "email", label: "Email address", type: "email", autoComplete: "email" },
  { key: "phone", label: "WhatsApp / phone", type: "tel", autoComplete: "tel" },
  { key: "country", label: "Country / region", type: "text", autoComplete: "country-name" },
  { key: "company", label: "Organization", type: "text", autoComplete: "organization" },
];

// Same demo/live switch as lib/paypal.ts (server side) — keep both in sync.
const IS_PAYPAL_LIVE = process.env.NEXT_PUBLIC_PAYPAL_ENV === "live";

const paypalOptions: ReactPayPalScriptOptions = {
  clientId:
    (IS_PAYPAL_LIVE
      ? process.env.NEXT_PUBLIC_LIVE_PAYPAL_CLIENT_ID
      : process.env.NEXT_PUBLIC_DEMO_PAYPAL_CLIENT_ID) ?? "",
  currency: "SGD",
  intent: "capture",
  components: "buttons",
};

// What the API routes expect per ticket (lib/validation.ts RegistrationFields).
type TicketPayload = {
  name: string;
  email: string;
  phone: string;
  country: string;
  company: string;
  ticketType: string;
  isMember: boolean;
  memberId: string;
};

// The member ID always comes from the confirmed APAC membership; the server
// ignores it anyway and uses its own verification record.
function toPayload(
  attendees: Attendee[],
  kind: TicketKind,
  tierId: string,
  verifiedMemberId: string
): TicketPayload[] {
  return attendees.map((attendee) => ({
    name: `${attendee.firstName.trim()} ${attendee.lastName.trim()}`.trim(),
    email: attendee.email,
    // Stored as one string, e.g. "+62 81234567890".
    phone: `+${dialCodeFor(attendee.phoneCountry)} ${attendee.phone.trim()}`,
    country: attendee.country,
    company: attendee.company,
    ticketType: tierId,
    isMember: kind === "member",
    memberId: kind === "member" ? verifiedMemberId : "",
  }));
}

// Ticket prices come from the current pricing tier, using the Member price
// for an APAC Member ticket (allowed by the server only with a confirmed APAC
// membership, see lib/apac.ts). Prices are in SGD
// (the base currency); each provider's charge is converted from it below.
function basePriceSGDFor(tickets: TicketPayload[]): number {
  return tickets.reduce((sum, ticket) => {
    const tier = getPricingTier(ticket.ticketType);
    return tier ? sum + tierPriceFor(tier, ticket.isMember) : sum;
  }, 0);
}

// Convert an SGD amount into what the method actually charges: IDR for Xendit,
// SGD (unchanged) for PayPal. Mirrors the server (app/api/.../route.ts).
function toMethodCurrency(method: PaymentMethod, sgd: number, rate: number): number {
  return method.currency === "IDR" ? sgdToIDR(sgd, rate) : sgd;
}

// The review-step price breakdown, every line in SGD (the base currency),
// plus the exact amount the chosen provider will actually charge (SGD via
// PayPal, IDR via Xendit).
// The fee is computed in the charge currency, so its SGD figure is converted
// back and is approximate.
function breakdownFor(
  method: PaymentMethod,
  tickets: TicketPayload[],
  promo: AppliedPromo | null,
  rate: number
) {
  const subtotalSGD = basePriceSGDFor(tickets);
  const promoSGD = promoDiscount(promo, subtotalSGD);
  const feeSGD = methodAmountToSGD(
    calculateFee(method, basePriceFor(method, tickets, promo, rate)),
    method.currency,
    rate
  );
  const chargeTotal = calculateTotal(method, basePriceFor(method, tickets, promo, rate));
  return {
    subtotalSGD,
    promoSGD,
    feeSGD,
    totalSGD: subtotalSGD - promoSGD + feeSGD,
    chargeTotal,
    currency: method.currency,
  };
}

// What the payment fee and total are computed on — the subtotal minus the
// promo discount (both in SGD), converted to the method's currency the same
// way the server does, so the preview matches the amount actually charged.
function basePriceFor(
  method: PaymentMethod,
  tickets: TicketPayload[],
  promo: AppliedPromo | null,
  rate: number
): number {
  const subtotalSGD = basePriceSGDFor(tickets);
  return toMethodCurrency(method, subtotalSGD - promoDiscount(promo, subtotalSGD), rate);
}

function formatAmount(amount: number, currency: "IDR" | "SGD"): string {
  if (currency === "IDR") {
    return `Rp ${Math.round(amount).toLocaleString("id-ID")}`;
  }
  return `S$ ${amount.toFixed(2)}`;
}

const MEMBERSHIP_LABEL = "APAC membership";

function attendeeMissingFields(attendee: Attendee, kind: TicketKind, memberVerified: boolean): string[] {
  const missing = fields
    .filter(({ key }) => {
      if (key === "email") return !EMAIL_PATTERN.test(attendee.email.trim());
      if (key === "phone") return attendee.phone.replace(/\D/g, "").length < MIN_PHONE_DIGITS;
      return attendee[key].trim() === "";
    })
    .map(({ label }) => label);
  if (kind === "member" && !memberVerified) {
    missing.push(MEMBERSHIP_LABEL);
  }
  return missing;
}

// Result of the APAC check, from /api/apac/callback's ?member= redirect.
const MEMBER_MESSAGES: Record<string, { ok: boolean; text: string }> = {
  verified: { ok: true, text: "Your APAC membership is confirmed." },
  inactive: {
    ok: false,
    text: "We couldn't find an active APAC membership on that account. You can renew on apacoaches.org, or register with a General Admission ticket.",
  },
  used: { ok: false, text: "This APAC membership has already been used to register." },
  expired: { ok: false, text: "The confirmation took too long or was already used. Please confirm your membership again." },
  invalid: { ok: false, text: "We couldn't confirm your membership. Please try again from this page." },
  error: { ok: false, text: "Membership confirmation is unavailable right now. Please try again later or contact us on WhatsApp." },
};

// The form is saved here before leaving for apacoaches.org and restored on return.
const DRAFT_KEY = "apac-register-draft";

type Draft = { kind: TicketKind; attendees: Attendee[]; consent: boolean; step: number };

const xenditMethods = paymentMethods.filter((method) => method.provider === "xendit");
const paypalMethods = paymentMethods.filter((method) => method.provider === "paypal");

// Field look without a width, for fields that size themselves in a row.
const fieldClass =
  "h-14 border border-(--brand-blue) bg-white px-4 text-base text-(--brand-ink) outline-none focus:border-2";
const inputClass = `${fieldClass} w-full`;

function ErrorNotice({ children }: { children: ReactNode }) {
  return (
    <p className="bg-(--brand-coral)/10 px-4 py-3 text-sm font-medium text-[#c22f2f]" role="alert">
      {children}
    </p>
  );
}

function PillButton({
  children,
  variant = "primary",
  ...props
}: { children: ReactNode; variant?: "primary" | "outline" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`flex h-16 w-full items-center justify-center rounded-full px-8 text-xl font-bold disabled:cursor-not-allowed disabled:opacity-50 sm:h-[74px] sm:text-2xl ${
        variant === "primary"
          ? "btn-yellow bg-(--brand-yellow) text-(--brand-ink)"
          : "btn-outline border border-(--brand-blue) bg-white text-(--brand-ink)"
      }`}
    >
      {children}
    </button>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex flex-wrap gap-x-10 gap-y-4">
      {STEPS.map((label, i) => {
        const state = i < step ? "done" : i === step ? "current" : "todo";
        return (
          <li key={label} className="flex items-center gap-4" aria-current={state === "current" ? "step" : undefined}>
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold sm:h-[54px] sm:w-[54px] ${
                state === "todo"
                  ? "border-[3px] border-(--brand-rule) text-(--brand-muted)"
                  : "bg-(--brand-blue) text-white"
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`border-b-[3px] pb-1 text-base font-bold sm:text-lg ${
                state === "todo"
                  ? "border-transparent text-(--brand-muted)"
                  : "border-(--brand-blue) text-(--brand-ink)"
              }`}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

async function createPayPalOrder(
  methodId: string,
  tickets: TicketPayload[],
  promoCode: string | undefined
): Promise<string> {
  const response = await fetch("/api/paypal/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method: methodId, tickets, promoCode }),
  });
  const data = (await response.json()) as { id?: string; error?: string };
  if (!data.id) {
    throw new Error(data.error ?? "Failed to create order");
  }
  return data.id;
}

export default function RegistrationForm({
  idrRate,
  memberVerification,
}: {
  idrRate: number;
  // Confirmed APAC membership for this browser (server-checked), or null.
  memberVerification: { memberId: string; expires: string } | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tierId = getPricingTier(searchParams.get("tier") ?? "")?.id ?? DEFAULT_TIER_ID;
  const tier = getPricingTier(tierId)!;
  const memberMessage = MEMBER_MESSAGES[searchParams.get("member") ?? ""] ?? null;
  const memberVerified = memberVerification !== null;

  const [step, setStep] = useState(0);
  const [kind, setKind] = useState<TicketKind>("general");
  const [attendees, setAttendees] = useState<Attendee[]>([emptyAttendee()]);
  const [consent, setConsent] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [xenditLoading, setXenditLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  // SGD→IDR rate for Xendit totals; replaced if the server reports a newer one.
  const [rate, setRate] = useState(idrRate);

  const tickets = toPayload(attendees, kind, tierId, memberVerification?.memberId ?? "");
  const invalidAttendees = attendees
    .map((attendee, index) => ({ index, missing: attendeeMissingFields(attendee, kind, memberVerified) }))
    .filter(({ missing }) => missing.length > 0);
  const detailsValid = invalidAttendees.length === 0 && consent;

  // Back from apacoaches.org (?member=…): restore what was typed before leaving.
  useEffect(() => {
    if (!searchParams.get("member")) return;
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      sessionStorage.removeItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as Draft;
      /* eslint-disable react-hooks/set-state-in-effect -- one-time restore from sessionStorage after a redirect */
      setKind(draft.kind);
      setAttendees(draft.attendees.length > 0 ? draft.attendees : [emptyAttendee()]);
      setConsent(draft.consent);
      setStep(draft.step);
      /* eslint-enable react-hooks/set-state-in-effect */
    } catch {
      // Storage blocked or draft unreadable: start fresh.
    }
  }, [searchParams]);

  // "Confirm APAC membership": save the form, then go via our start route to
  // the APAC login/verify page. We come back to /register?member=<result>.
  function confirmMembership() {
    try {
      const draft: Draft = { kind, attendees, consent, step };
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Storage blocked: the details will need retyping, the check still works.
    }
    window.location.assign(`/api/apac/start?tier=${encodeURIComponent(tierId)}`);
  }

  function chooseKind(next: TicketKind) {
    setKind(next);
    setAttendees((current) => {
      if (next === "group") {
        return current.length >= MIN_GROUP_SIZE
          ? current
          : [...current, ...Array.from({ length: MIN_GROUP_SIZE - current.length }, emptyAttendee)];
      }
      return current.slice(0, 1);
    });
  }

  function updateAttendee(index: number, key: keyof Attendee, value: string) {
    setAttendees((current) =>
      current.map((attendee, i) => (i === index ? { ...attendee, [key]: value } : attendee))
    );
  }

  function setGroupSize(size: number) {
    const clamped = Math.min(MAX_TICKETS_PER_ORDER, Math.max(MIN_GROUP_SIZE, size));
    setAttendees((current) =>
      clamped > current.length
        ? [...current, ...Array.from({ length: clamped - current.length }, emptyAttendee)]
        : current.slice(0, clamped)
    );
  }

  function goToReview() {
    if (!detailsValid) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setStep(2);
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

  async function applyPromo() {
    if (!promoInput.trim()) return;
    setPromoError(null);
    setPromoLoading(true);
    try {
      const response = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput }),
      });
      const result = (await response.json()) as { promo?: AppliedPromo; error?: string };
      if (!result.promo) {
        setPromoError(result.error ?? "This promo code is not valid");
        return;
      }
      setAppliedPromo(result.promo);
      setPromoInput("");
    } catch {
      setPromoError("Couldn't check this promo code. Please try again.");
    } finally {
      setPromoLoading(false);
    }
  }

  function removePromo() {
    setAppliedPromo(null);
    setPromoError(null);
  }

  async function payWithXendit() {
    if (!selectedMethod) return;
    setError(null);
    setXenditLoading(true);
    try {
      const response = await fetch("/api/xendit/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tickets,
          method: selectedMethod.id,
          promoCode: appliedPromo?.code,
          idrRate: rate,
        }),
      });
      const result = (await response.json()) as { invoiceUrl?: string; error?: string; idrRate?: number };
      if (response.status === 409 && result.error === "rate_changed" && result.idrRate) {
        setRate(result.idrRate);
        setError("The exchange rate was just updated. Please review the new total and pay again.");
        setXenditLoading(false);
        return;
      }
      if (!result.invoiceUrl) {
        setError(result.error ?? "Failed to start Xendit payment.");
        setXenditLoading(false);
        return;
      }
      window.location.assign(result.invoiceUrl);
    } catch {
      setError("Something went wrong starting Xendit payment. Please try again.");
      setXenditLoading(false);
    }
  }

  const priceSGDFor = (option: TicketKind) =>
    option === "member" ? tier.memberPrice : tier.nonMemberPrice;
  const selectedOption = TICKET_OPTIONS.find((option) => option.kind === kind)!;

  return (
    // The whole form renders at 72% of the design's size (text, fields,
    // buttons and spacing alike), so it reads less heavy on the page.
    <div className="flex flex-col gap-10 text-(--brand-ink)" style={{ zoom: 0.72 }}>
      <Stepper step={step} />

      {/* The card, with the design's offset yellow block behind it */}
      <div className="relative">
        <div className="absolute inset-0 translate-x-3 translate-y-3 bg-(--brand-yellow) sm:translate-x-[18px] sm:translate-y-[19px]" aria-hidden />
        <div className="relative flex flex-col gap-8 border-2 border-(--brand-blue) bg-white px-5 py-8 sm:px-14 sm:py-12">
          <div className="flex flex-col gap-2">
            <p className="text-base font-bold tracking-[0.16em] sm:text-lg">Step {step + 1} of 3</p>
            <h2 className="text-3xl font-bold sm:text-5xl">
              {step === 0 ? "Choose your ticket" : step === 1 ? "Your details" : "Review & payment"}
            </h2>
            <p className="text-base sm:text-lg">
              {step === 0
                ? `${tier.name} pricing. Final inclusions are awaiting organizer confirmation.`
                : step === 1
                  ? "Fields marked with an asterisk are required."
                  : "Check your order, then choose how to pay."}
            </p>
          </div>

          {step === 0 && (
            <>
              <div className="flex flex-col gap-5" role="radiogroup" aria-label="Ticket type">
                {TICKET_OPTIONS.map((option) => {
                  const selected = kind === option.kind;
                  return (
                    <button
                      key={option.kind}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => chooseKind(option.kind)}
                      className={`flex items-center gap-5 border-2 border-(--brand-blue) px-5 py-6 text-left transition-colors sm:gap-8 sm:px-9 sm:py-8 ${
                        selected ? "bg-(--brand-tint)" : "bg-white hover:bg-(--brand-tint)/60"
                      }`}
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-(--brand-blue)">
                        {selected && <span className="h-8 w-8 rounded-full bg-(--brand-blue)" />}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="text-xl font-bold sm:text-3xl">{option.name}</span>
                        <span className="text-sm sm:text-lg">{option.audience}</span>
                      </span>
                      <span className="shrink-0 text-right text-lg font-bold tracking-tight sm:text-3xl">
                        {formatSGD(priceSGDFor(option.kind))}
                        {option.kind === "group" && (
                          <span className="block text-xs font-medium tracking-normal sm:text-sm">per person</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              {kind === "group" && (
                <div className="flex flex-wrap items-center justify-between gap-4 border-2 border-dashed border-(--brand-blue)/40 px-5 py-4">
                  <div>
                    <p className="text-lg font-bold">Number of people</p>
                    <p className="text-sm">
                      {MIN_GROUP_SIZE} to {MAX_TICKETS_PER_ORDER} per order
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setGroupSize(attendees.length - 1)}
                      disabled={attendees.length <= MIN_GROUP_SIZE}
                      className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-(--brand-blue) text-xl font-bold transition-colors enabled:hover:bg-(--brand-blue) enabled:hover:text-white disabled:opacity-40"
                      aria-label="Remove a person"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-2xl font-bold">{attendees.length}</span>
                    <button
                      type="button"
                      onClick={() => setGroupSize(attendees.length + 1)}
                      disabled={attendees.length >= MAX_TICKETS_PER_ORDER}
                      className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-(--brand-blue) text-xl font-bold transition-colors enabled:hover:bg-(--brand-blue) enabled:hover:text-white disabled:opacity-40"
                      aria-label="Add a person"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="sm:max-w-sm">
                <PillButton onClick={() => setStep(1)}>Continue</PillButton>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              {attendees.map((attendee, index) => {
                const missing = showErrors ? attendeeMissingFields(attendee, kind, memberVerified) : [];
                return (
                  <fieldset key={index} className="flex flex-col gap-6">
                    {attendees.length > 1 && (
                      <legend className="mb-2 text-xl font-bold">
                        Participant {index + 1}
                        {index === 0 && " (you)"}
                      </legend>
                    )}
                    <div className="grid grid-cols-1 gap-x-16 gap-y-6 md:grid-cols-2">
                      {fields.map(({ key, label, type, autoComplete }) => {
                        const invalid = missing.includes(label);
                        const errorClass = invalid ? "border-2 border-[#c22f2f]" : "";

                        if (key === "phone") {
                          return (
                            <div key={key} className="flex flex-col gap-3">
                              <span className="text-lg font-bold sm:text-2xl" id={`phone-label-${index}`}>
                                {label} *
                              </span>
                              <div className="flex gap-2" role="group" aria-labelledby={`phone-label-${index}`}>
                                <select
                                  value={attendee.phoneCountry}
                                  onChange={(event) => updateAttendee(index, "phoneCountry", event.target.value)}
                                  aria-label="Country dialling code"
                                  className={`${fieldClass} w-32 shrink-0 px-2`}
                                >
                                  {countries.map((country) => (
                                    <option key={country.code} value={country.code}>
                                      {country.code} +{country.dial}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="tel"
                                  inputMode="tel"
                                  autoComplete={index === 0 ? "tel-national" : "off"}
                                  placeholder=""
                                  value={attendee.phone}
                                  onChange={(event) => updateAttendee(index, "phone", event.target.value)}
                                  aria-label="Phone number"
                                  aria-invalid={invalid}
                                  className={`${fieldClass} min-w-0 flex-1 ${errorClass}`}
                                />
                              </div>
                              <span className="text-sm">Preferably your WhatsApp number.</span>
                            </div>
                          );
                        }

                        if (key === "country") {
                          return (
                            <label key={key} className="flex flex-col gap-3">
                              <span className="text-lg font-bold sm:text-2xl">{label} *</span>
                              <select
                                value={attendee.country}
                                onChange={(event) => updateAttendee(index, "country", event.target.value)}
                                autoComplete={index === 0 ? "country-name" : "off"}
                                aria-invalid={invalid}
                                className={`${inputClass} ${errorClass}`}
                              >
                                <option value="" disabled>
                                  Select a country or region
                                </option>
                                {countries.map((country) => (
                                  <option key={country.code} value={country.name}>
                                    {country.name}
                                  </option>
                                ))}
                              </select>
                            </label>
                          );
                        }

                        return (
                          <label key={key} className="flex flex-col gap-3">
                            <span className="text-lg font-bold sm:text-2xl">{label} *</span>
                            <input
                              type={type}
                              autoComplete={index === 0 ? autoComplete : "off"}
                              value={attendee[key]}
                              onChange={(event) => updateAttendee(index, key, event.target.value)}
                              aria-invalid={invalid}
                              className={`${inputClass} ${errorClass}`}
                            />
                            {key === "email" && (
                              <span className="text-sm">The ticket is sent to this email.</span>
                            )}
                          </label>
                        );
                      })}
                      {kind === "member" && (
                        <div
                          className={`flex flex-col gap-4 border-2 px-5 py-5 md:col-span-2 ${
                            memberVerified
                              ? "border-(--brand-blue) bg-(--brand-tint)"
                              : missing.includes(MEMBERSHIP_LABEL)
                                ? "border-[#c22f2f] bg-white"
                                : "border-dashed border-(--brand-blue)/50 bg-white"
                          }`}
                        >
                          <span className="text-lg font-bold sm:text-2xl">APAC membership *</span>
                          {memberVerification ? (
                            <p className="text-base sm:text-lg">
                              <span className="font-bold">✓ Confirmed</span> · Member ID {memberVerification.memberId}
                            </p>
                          ) : (
                            <>
                              <p className="text-base sm:text-lg">
                                Log in to your apacoaches.org account to confirm your membership. Your details here are
                                kept while you&apos;re away.
                              </p>
                              <div className="sm:max-w-sm">
                                <PillButton onClick={confirmMembership}>Confirm APAC membership</PillButton>
                              </div>
                            </>
                          )}
                          {memberMessage && !memberMessage.ok && !memberVerified && (
                            <p className="text-sm font-medium text-[#c22f2f] sm:text-base">{memberMessage.text}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </fieldset>
                );
              })}

              <label className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  className="mt-1 h-7 w-7 shrink-0 accent-(--brand-blue)"
                />
                <span className="text-base sm:text-lg">
                  I confirm that the information provided is accurate and agree to receive registration
                  updates.
                </span>
              </label>

              {showErrors && !detailsValid && (
                <ErrorNotice>
                  {invalidAttendees.length > 0
                    ? `Fill in the required fields${attendees.length > 1 ? ` for ${invalidAttendees.map(({ index }) => `Participant ${index + 1}`).join(", ")}` : ""}.`
                    : "Please tick the confirmation box to continue."}
                </ErrorNotice>
              )}

              <div className="grid gap-4 sm:grid-cols-2 sm:gap-16">
                <PillButton variant="outline" onClick={() => setStep(0)}>
                  Back
                </PillButton>
                <PillButton onClick={goToReview}>Continue</PillButton>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4 bg-(--brand-blue) px-6 py-8 text-white sm:px-10">
                <div>
                  <p className="text-sm font-bold uppercase text-(--brand-yellow-text) sm:text-base">Selected ticket</p>
                  <p className="text-2xl font-bold sm:text-3xl">
                    {selectedOption.name}
                    {attendees.length > 1 && ` × ${attendees.length}`}
                  </p>
                </div>
                <p className="text-right text-2xl font-bold tracking-tight text-(--brand-yellow-text) sm:text-4xl">
                  {formatSGD(basePriceSGDFor(tickets))}
                </p>
              </div>

              <div className="flex flex-col gap-8 border border-black px-5 py-8 sm:px-10">
                <div className="flex flex-col gap-2">
                  <p className="text-lg font-bold">{attendees.length > 1 ? "Participants" : "Participant"}</p>
                  <ul className="flex flex-col gap-1 text-base">
                    {tickets.map((ticket, i) => (
                      <li key={i}>
                        <span className="font-semibold">{ticket.name}</span> · {ticket.email}
                      </li>
                    ))}
                  </ul>
                </div>

                <PaymentMethodGroup
                  title="Pay with PayPal (SGD)"
                  methods={paypalMethods}
                  tickets={tickets}
                  promo={appliedPromo}
                  rate={rate}
                  selectedId={selectedMethod?.id ?? null}
                  onSelect={setSelectedMethod}
                />
                <PaymentMethodGroup
                  title="Pay with Xendit (IDR)"
                  methods={xenditMethods}
                  tickets={tickets}
                  promo={appliedPromo}
                  rate={rate}
                  selectedId={selectedMethod?.id ?? null}
                  onSelect={setSelectedMethod}
                />

                <div className="flex flex-col gap-3">
                  <p className="text-lg font-bold">Promo code</p>
                  {appliedPromo ? (
                    <div className="flex items-center justify-between gap-4 border-2 border-(--brand-blue) bg-(--brand-tint) px-5 py-4">
                      <div>
                        <p className="font-bold">{appliedPromo.code}</p>
                        <p className="text-sm">{describePromo(appliedPromo)} applied</p>
                      </div>
                      <button
                        type="button"
                        onClick={removePromo}
                        disabled={submitting || xenditLoading}
                        className="text-sm font-bold underline decoration-2 underline-offset-2 transition-colors enabled:hover:decoration-(--brand-coral) disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(event) => setPromoInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            applyPromo();
                          }
                        }}
                        placeholder="Enter promo code"
                        aria-label="Promo code"
                        className={`${inputClass} uppercase`}
                      />
                      <button
                        type="button"
                        onClick={applyPromo}
                        disabled={promoLoading || !promoInput.trim()}
                        className="btn-outline shrink-0 rounded-full border border-(--brand-blue) px-6 font-bold disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {promoLoading ? "Checking…" : "Apply"}
                      </button>
                    </div>
                  )}
                  {promoError && <p className="text-sm font-medium text-[#c22f2f]">{promoError}</p>}
                </div>

                {selectedMethod &&
                  (() => {
                    const b = breakdownFor(selectedMethod, tickets, appliedPromo, rate);
                    return (
                      <div className="flex flex-col gap-2 bg-(--brand-cream) p-5 text-base">
                        <div className="flex items-center justify-between">
                          <span>Ticket price × {tickets.length}</span>
                          <span>{formatSGD(b.subtotalSGD)}</span>
                        </div>
                        {appliedPromo && (
                          <div className="flex items-center justify-between text-[#c22f2f]">
                            <span>Promo ({appliedPromo.code})</span>
                            <span>−{formatSGD(b.promoSGD)}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span>Payment fee</span>
                          <span>+{formatSGD(b.feeSGD)}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between border-t border-(--brand-rule) pt-3">
                          <span className="font-bold">Total</span>
                          <span className="text-right text-2xl font-bold">
                            {formatSGD(b.totalSGD)}
                            {b.currency === "IDR" && (
                              <span className="block text-sm font-medium">
                                You pay {formatAmount(b.chargeTotal, b.currency)}
                              </span>
                            )}
                          </span>
                        </div>
                        <p className="text-sm">
                          {b.currency === "IDR"
                            ? `Prices are in Singapore Dollars (SGD). Xendit charges the equivalent in Indonesian Rupiah (IDR) at today's rate of S$ 1 = Rp ${rate.toLocaleString("id-ID")} (European Central Bank reference rate); your bank may add a conversion fee.`
                            : "You pay in Singapore Dollars (SGD) via PayPal."}
                        </p>
                      </div>
                    );
                  })()}
              </div>

              {error && <ErrorNotice>{error}</ErrorNotice>}

              <div className="grid items-start gap-4 sm:grid-cols-2 sm:gap-16">
                <PillButton variant="outline" onClick={() => setStep(1)} disabled={submitting || xenditLoading}>
                  Edit details
                </PillButton>
                {selectedMethod?.provider === "xendit" && (
                  <PillButton onClick={payWithXendit} disabled={xenditLoading}>
                    {xenditLoading ? "Redirecting…" : "Pay now"}
                  </PillButton>
                )}
                {selectedMethod?.provider === "paypal" && (
                  <PayPalScriptProvider options={paypalOptions}>
                    <PayPalButtons
                      disabled={submitting}
                      style={{ layout: "vertical", color: "gold", shape: "pill", height: 55 }}
                      // Re-mount the buttons when the promo changes so createOrder
                      // isn't stuck with the code from the first render.
                      forceReRender={[appliedPromo?.code ?? ""]}
                      createOrder={() => {
                        setError(null);
                        return createPayPalOrder(selectedMethod.id, tickets, appliedPromo?.code);
                      }}
                      onApprove={(data) => capturePayment(data.orderID)}
                      onError={handlePaymentError}
                    />
                  </PayPalScriptProvider>
                )}
                {!selectedMethod && (
                  <p className="self-center text-base">Choose a payment method above to continue.</p>
                )}
              </div>

              <p className="text-base">
                Questions before you pay?{" "}
                <a href={helpWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-(--brand-whatsapp) underline">
                  Ask on WhatsApp
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PaymentMethodGroup({
  title,
  methods,
  tickets,
  promo,
  rate,
  selectedId,
  onSelect,
}: {
  title: string;
  methods: PaymentMethod[];
  tickets: TicketPayload[];
  promo: AppliedPromo | null;
  rate: number;
  selectedId: string | null;
  onSelect: (method: PaymentMethod) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-lg font-bold">{title}</p>
      <div className="flex flex-col gap-2">
        {methods.map((method) => {
          const isSelected = selectedId === method.id;
          const fee = calculateFee(method, basePriceFor(method, tickets, promo, rate));
          return (
            <label
              key={method.id}
              className={`flex cursor-pointer flex-col gap-2 border px-4 py-3 transition-colors ${
                isSelected
                  ? "border-2 border-(--brand-blue) bg-(--brand-tint)"
                  : "border-(--brand-rule) bg-white hover:border-(--brand-blue) hover:bg-(--brand-tint)/40"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment-method"
                    checked={isSelected}
                    onChange={() => onSelect(method)}
                    className="h-5 w-5 accent-(--brand-blue)"
                  />
                  <div>
                    <p className="font-bold">{method.label}</p>
                    <p className="text-sm">{method.description}</p>
                  </div>
                </div>
                <span className="shrink-0 text-sm">+{formatSGD(methodAmountToSGD(fee, method.currency, rate))}</span>
              </div>
              {(method.badges || method.cardNetworks) && (
                <div className="flex flex-wrap items-center gap-1.5 pl-8">
                  {method.badges?.map((badge) => (
                    <span key={badge} className="bg-(--brand-cream) px-2 py-0.5 text-xs font-semibold">
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
