import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "../../components/SectionHeading";
import { event } from "../../data/event";

export const metadata: Metadata = {
  title: "You're registered | Loop Coaching Summit 2026",
  description: "Registration confirmed for Loop Coaching Summit 2026.",
};

export default function RegisterSuccessPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-20">
      <SectionHeading
        eyebrow="You're in"
        title="Check your email for your ticket"
        description="We've sent a QR-code ticket to the email address you registered with. Bring it (printed or on your phone) to check in at the venue."
      />
      <p className="text-sm text-foreground/70">
        Not receiving the email?{" "}
        <a
          href={`https://wa.me/${event.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-accent hover:underline"
        >
          Contact us here
        </a>
        .
      </p>
      <Link href="/" className="w-fit text-sm font-semibold text-accent hover:underline">
        &larr; Back to home
      </Link>
    </div>
  );
}
