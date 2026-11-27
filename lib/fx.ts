import "server-only";
import { SGD_TO_IDR_FALLBACK } from "@/app/data/pricing";

// Daily ECB reference rate via Frankfurter (free, no key). The ECB publishes once
// per business day, so re-checking hourly picks up a new rate within an hour.
const FX_URL = "https://api.frankfurter.dev/v1/latest?base=SGD&symbols=IDR";
const REVALIDATE_SECONDS = 3600;

// Anything outside this range is treated as a bad response and ignored.
const MIN_RATE = 10_000;
const MAX_RATE = 20_000;

let lastGoodRate: number | null = null;

export type FxRate = { rate: number; source: "live" | "fallback" };

export async function getSgdToIdrRate(): Promise<FxRate> {
  try {
    const res = await fetch(FX_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(`Frankfurter responded ${res.status}`);
    const data = (await res.json()) as { rates?: { IDR?: unknown } };
    const rate = data.rates?.IDR;
    if (typeof rate !== "number" || !Number.isFinite(rate) || rate < MIN_RATE || rate > MAX_RATE) {
      throw new Error(`Frankfurter returned an invalid SGD→IDR rate: ${String(rate)}`);
    }
    lastGoodRate = rate;
    return { rate, source: "live" };
  } catch (error) {
    console.error("FX rate fetch failed, using fallback", error);
    return { rate: lastGoodRate ?? SGD_TO_IDR_FALLBACK, source: "fallback" };
  }
}
