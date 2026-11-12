"use client";

import { useState, type ReactNode } from "react";
import {
  PROMO_DISCOUNT_LABELS,
  describePromo,
  type PromoDiscountType,
} from "@/app/data/promo";
import type { PromoCode } from "@/lib/supabase";

// Same fixed light palette as RegistrationForm — internal tool, no dark mode.
const INK = "#241c15";
const INK_MUTED = "#6b6250";
const PANEL_BG = "#ffffff";
const SOFT_BG = "#f1e7d3";
const BORDER = "#e4dac4";
const ACCENT = "#c75b39";

type GenerateForm = {
  mode: "random" | "custom";
  customCode: string;
  prefix: string;
  quantity: string;
  discountType: PromoDiscountType;
  discountValue: string;
  maxUses: string;
  validUntil: string;
  note: string;
};

const emptyGenerateForm: GenerateForm = {
  mode: "random",
  customCode: "",
  prefix: "",
  quantity: "1",
  discountType: "percent",
  discountValue: "",
  maxUses: "1",
  validUntil: "",
  note: "",
};

function promoStatus(promo: PromoCode): string {
  if (!promo.active) return "Disabled";
  if (promo.valid_until && new Date(promo.valid_until).getTime() < Date.now()) return "Expired";
  if (promo.max_uses !== null && promo.used_count >= promo.max_uses) return "Used up";
  return "Active";
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium" style={{ color: INK }}>
        {label}
      </span>
      {children}
      {hint && (
        <span className="text-xs" style={{ color: INK_MUTED }}>
          {hint}
        </span>
      )}
    </label>
  );
}

const inputClass =
  "rounded-2xl border px-4 py-2.5 outline-none transition-colors focus:border-[#c75b39]";
const inputStyle = { backgroundColor: PANEL_BG, borderColor: BORDER, color: INK };

export default function PromoCodesAdminPage() {
  const [secret, setSecret] = useState("");
  const [secretInput, setSecretInput] = useState("");
  const [promoCodes, setPromoCodes] = useState<PromoCode[] | null>(null);
  const [form, setForm] = useState<GenerateForm>(emptyGenerateForm);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string[]>([]);

  async function adminFetch(init: RequestInit = {}, withSecret = secret) {
    return fetch("/api/admin/promo-codes", {
      ...init,
      headers: { "Content-Type": "application/json", "x-admin-secret": withSecret },
    });
  }

  async function loadPromoCodes(withSecret: string) {
    const response = await adminFetch({}, withSecret);
    setError(null);
    if (response.status === 401) {
      setSecret("");
      setError("Wrong admin secret.");
      return;
    }
    const result = (await response.json()) as { promoCodes?: PromoCode[]; error?: string };
    if (!result.promoCodes) {
      setError(result.error ?? "Failed to load promo codes");
      return;
    }
    // Kept in memory only — a page refresh asks for the secret again.
    setSecret(withSecret);
    setPromoCodes(result.promoCodes);
  }

  function updateForm<K extends keyof GenerateForm>(key: K, value: GenerateForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function generate() {
    setError(null);
    setGenerating(true);
    try {
      const response = await adminFetch({
        method: "POST",
        body: JSON.stringify({
          customCode: form.mode === "custom" ? form.customCode : undefined,
          prefix: form.mode === "random" ? form.prefix : undefined,
          quantity: form.mode === "random" ? Number(form.quantity) : undefined,
          discountType: form.discountType,
          discountValue: Number(form.discountValue),
          maxUses: form.maxUses.trim() ? Number(form.maxUses) : null,
          // datetime-local has no timezone — convert in the browser so the
          // expiry is the admin's local time, not the server's.
          validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : null,
          note: form.note,
        }),
      });
      const result = (await response.json()) as { promoCodes?: PromoCode[]; error?: string };
      if (!result.promoCodes) {
        setError(result.error ?? "Failed to create promo codes");
        return;
      }
      setLastGenerated(result.promoCodes.map((promo) => promo.code));
      setPromoCodes((current) => [...result.promoCodes!, ...(current ?? [])]);
      setForm((current) => ({ ...emptyGenerateForm, discountType: current.discountType }));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function toggleActive(promo: PromoCode) {
    setError(null);
    const response = await adminFetch({
      method: "PATCH",
      body: JSON.stringify({ id: promo.id, active: !promo.active }),
    });
    const result = (await response.json()) as { promoCode?: PromoCode; error?: string };
    if (!result.promoCode) {
      setError(result.error ?? "Failed to update promo code");
      return;
    }
    setPromoCodes((current) =>
      (current ?? []).map((item) => (item.id === promo.id ? result.promoCode! : item))
    );
  }

  function logout() {
    setSecret("");
    setPromoCodes(null);
  }

  if (!secret) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-6 py-20">
        <div
          className="flex flex-col gap-4 rounded-3xl border p-6"
          style={{ backgroundColor: PANEL_BG, borderColor: BORDER }}
        >
          <h1 className="text-xl font-semibold" style={{ color: INK }}>
            Promo codes — admin
          </h1>
          <Field label="Admin secret">
            <input
              type="password"
              value={secretInput}
              onChange={(event) => setSecretInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && secretInput) loadPromoCodes(secretInput);
              }}
              className={inputClass}
              style={inputStyle}
            />
          </Field>
          {error && (
            <p className="text-sm font-medium" style={{ color: ACCENT }}>
              {error}
            </p>
          )}
          <button
            type="button"
            disabled={!secretInput}
            onClick={() => loadPromoCodes(secretInput)}
            className="flex h-11 items-center justify-center rounded-full text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: ACCENT }}
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Promo codes</h1>
        <button type="button" onClick={logout} className="text-sm font-semibold underline">
          Sign out
        </button>
      </div>

      <div
        className="flex flex-col gap-5 rounded-3xl border p-6"
        style={{ backgroundColor: PANEL_BG, borderColor: BORDER }}
      >
        <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: INK_MUTED }}>
          Generate
        </p>

        <div className="flex gap-4 text-sm" style={{ color: INK }}>
          {(["random", "custom"] as const).map((mode) => (
            <label key={mode} className="flex items-center gap-2">
              <input
                type="radio"
                checked={form.mode === mode}
                onChange={() => updateForm("mode", mode)}
                className="h-4 w-4 accent-[#c75b39]"
              />
              {mode === "random" ? "Random codes" : "Custom code"}
            </label>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {form.mode === "random" ? (
            <>
              <Field label="Prefix (optional)" hint='e.g. "VIP" → VIP-7KQ2M9XA'>
                <input
                  type="text"
                  value={form.prefix}
                  onChange={(event) => updateForm("prefix", event.target.value)}
                  className={`${inputClass} uppercase`}
                  style={inputStyle}
                />
              </Field>
              <Field label="How many codes" hint="1–100">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={form.quantity}
                  onChange={(event) => updateForm("quantity", event.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </Field>
            </>
          ) : (
            <Field label="Code" hint="3–32 letters, numbers, or dashes">
              <input
                type="text"
                value={form.customCode}
                onChange={(event) => updateForm("customCode", event.target.value)}
                className={`${inputClass} uppercase`}
                style={inputStyle}
              />
            </Field>
          )}

          <Field label="Discount type">
            <select
              value={form.discountType}
              onChange={(event) => updateForm("discountType", event.target.value as PromoDiscountType)}
              className={inputClass}
              style={inputStyle}
            >
              {(Object.keys(PROMO_DISCOUNT_LABELS) as PromoDiscountType[]).map((type) => (
                <option key={type} value={type}>
                  {PROMO_DISCOUNT_LABELS[type]}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label={form.discountType === "percent" ? "Discount (%)" : "Discount (USD)"}
            hint={
              form.discountType === "percent"
                ? "1–100. Payment fee is still charged on top."
                : "Converted to Rupiah for Xendit payments."
            }
          >
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.discountValue}
              onChange={(event) => updateForm("discountValue", event.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </Field>
          <Field label="Max uses per code" hint="Paid orders only. Leave empty for unlimited.">
            <input
              type="number"
              min={1}
              value={form.maxUses}
              onChange={(event) => updateForm("maxUses", event.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </Field>
          <Field label="Valid until (optional)" hint="Leave empty to never expire.">
            <input
              type="datetime-local"
              value={form.validUntil}
              onChange={(event) => updateForm("validUntil", event.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </Field>
          <Field label="Note (optional)" hint="Internal only, e.g. who the codes are for.">
            <input
              type="text"
              value={form.note}
              onChange={(event) => updateForm("note", event.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </Field>
        </div>

        {error && (
          <p className="text-sm font-medium" style={{ color: ACCENT }}>
            {error}
          </p>
        )}

        <button
          type="button"
          disabled={generating || !form.discountValue}
          onClick={generate}
          className="flex h-11 items-center justify-center self-start rounded-full px-8 text-sm font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: ACCENT }}
        >
          {generating ? "Generating…" : "Generate"}
        </button>

        {lastGenerated.length > 0 && (
          <div className="flex flex-col gap-2 rounded-2xl p-4" style={{ backgroundColor: SOFT_BG }}>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold" style={{ color: INK }}>
                {lastGenerated.length} code{lastGenerated.length > 1 ? "s" : ""} created
              </p>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(lastGenerated.join("\n"))}
                className="text-sm font-semibold underline"
                style={{ color: ACCENT }}
              >
                Copy all
              </button>
            </div>
            <p className="break-all font-mono text-sm" style={{ color: INK }}>
              {lastGenerated.join(", ")}
            </p>
          </div>
        )}
      </div>

      <div
        className="overflow-x-auto rounded-3xl border"
        style={{ backgroundColor: PANEL_BG, borderColor: BORDER }}
      >
        <table className="w-full min-w-180 text-left text-sm" style={{ color: INK }}>
          <thead style={{ backgroundColor: SOFT_BG }}>
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Used</th>
              <th className="px-4 py-3">Valid until</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Note</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {promoCodes?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center" style={{ color: INK_MUTED }}>
                  No promo codes yet.
                </td>
              </tr>
            )}
            {promoCodes?.map((promo) => (
              <tr key={promo.id} className="border-t" style={{ borderColor: BORDER }}>
                <td className="px-4 py-3 font-mono font-semibold">{promo.code}</td>
                <td className="px-4 py-3">
                  {describePromo({
                    code: promo.code,
                    discountType: promo.discount_type,
                    discountValue: Number(promo.discount_value),
                  })}
                </td>
                <td className="px-4 py-3">
                  {promo.used_count} / {promo.max_uses ?? "∞"}
                </td>
                <td className="px-4 py-3">
                  {promo.valid_until ? new Date(promo.valid_until).toLocaleString("id-ID") : "—"}
                </td>
                <td className="px-4 py-3">{promoStatus(promo)}</td>
                <td className="px-4 py-3" style={{ color: INK_MUTED }}>
                  {promo.note ?? ""}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => toggleActive(promo)}
                    className="text-sm font-semibold underline"
                    style={{ color: ACCENT }}
                  >
                    {promo.active ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
