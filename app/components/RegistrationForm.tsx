"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PayPalScriptProvider,
  PayPalButtons,
  type ReactPayPalScriptOptions,
} from "@paypal/react-paypal-js";

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
};

export default function RegistrationForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isValid =
    form.name.trim() !== "" &&
    EMAIL_PATTERN.test(form.email.trim()) &&
    form.phone.trim() !== "" &&
    form.country.trim() !== "" &&
    form.company.trim() !== "";

  return (
    <div className="flex flex-col gap-8 rounded-3xl border border-black/[.08] bg-background p-6 dark:border-white/[.145] dark:bg-[#241c15] sm:p-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map(({ key, label, type }) => (
          <label key={key} className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">{label}</span>
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

      {isValid ? (
        <PayPalScriptProvider options={paypalOptions}>
          <PayPalButtons
            disabled={submitting}
            style={{ layout: "vertical", color: "gold", shape: "pill" }}
            createOrder={async () => {
              setError(null);
              const response = await fetch("/api/paypal/create-order", { method: "POST" });
              const data = (await response.json()) as { id?: string; error?: string };
              if (!data.id) {
                throw new Error(data.error ?? "Failed to create order");
              }
              return data.id;
            }}
            onApprove={async (data) => {
              setSubmitting(true);
              try {
                const response = await fetch("/api/paypal/capture-order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderID: data.orderID, ...form }),
                });
                const result = (await response.json()) as {
                  success: boolean;
                  error?: string;
                };
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
            }}
            onError={() => {
              setError("PayPal ran into a problem. Please try again.");
              setSubmitting(false);
            }}
          />
        </PayPalScriptProvider>
      ) : (
        <p className="text-sm text-foreground/60">
          Fill in the form above to continue to payment.
        </p>
      )}
    </div>
  );
}
