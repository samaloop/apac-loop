import type { Metadata } from "next";
import Link from "next/link";
import { helpWhatsAppUrl } from "../../data/event";
import PageHero from "../../components/PageHero";

export const metadata: Metadata = {
  title: "You're registered | APAC Coaching Conference 2027",
  description: "Registration confirmed for APAC Coaching Conference 2027.",
};

export default function RegisterSuccessPage() {
  return (
    <div className="flex flex-col bg-(--brand-cream) text-(--brand-ink)">
      <PageHero
        eyebrow="You’re registered"
        eyebrowClassName="text-white"
        title="See you at"
        highlight="the frontier."
        description="We’ve sent a QR-code ticket to the email address you registered with. Bring it, printed or on your phone, to check in at the venue."
      />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-16 text-lg">
        <p>
          Not receiving the email? Check your spam folder first, then{" "}
          <a href={helpWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline">
            contact us on WhatsApp
          </a>
          .
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/venue"
            className="flex h-12 items-center rounded-full bg-(--brand-yellow) px-7 text-sm font-bold uppercase"
          >
            Plan your Bali stay
          </Link>
          <Link
            href="/"
            className="flex h-12 items-center rounded-full border border-(--brand-blue) px-7 text-sm font-bold uppercase"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
