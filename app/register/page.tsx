import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import PageHero from "../components/PageHero";
import RegistrationForm from "../components/RegistrationForm";

export const metadata: Metadata = {
  title: "Register | APAC Coaching Conference 2027",
  description: "Register for APAC Coaching Conference 2027.",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-col bg-(--brand-cream) text-(--brand-ink)">
      <PageHero
        eyebrow="Registration is open"
        eyebrowClassName="text-white"
        title="Join us at"
        highlight="the frontier."
        description="Choose your ticket, add participant details and complete payment to receive your ticket by email."
      />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pt-12 pb-20">
        <Suspense>
          <RegistrationForm />
        </Suspense>
        <p className="text-center text-base sm:text-lg">
          Need more information first?{" "}
          <Link href="/venue" className="font-bold underline-offset-4 hover:underline">
            Plan your Bali stay
          </Link>{" "}
          or{" "}
          <Link href="/agenda" className="font-bold underline-offset-4 hover:underline">
            view the agenda
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
