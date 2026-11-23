import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import PageHero from "../components/PageHero";
import RegistrationForm from "../components/RegistrationForm";
import { registrationOpen, REGISTRATION_CLOSED_LABEL } from "../data/registration";
import { helpWhatsAppUrl } from "../data/event";

export const metadata: Metadata = {
  title: "Register | APAC Coaching Conference 2027",
  description: "Register for APAC Coaching Conference 2027.",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-col bg-(--brand-cream) text-(--brand-ink)">
      <PageHero
        eyebrow={registrationOpen ? "Registration is open" : REGISTRATION_CLOSED_LABEL}
        eyebrowClassName="text-white"
        title="Join us at"
        highlight="the frontier."
        description={
          registrationOpen
            ? "Choose your ticket, add participant details and complete payment to receive your ticket by email."
            : "Registration for APAC Coaching Conference 2027 is not open yet. Please check back soon."
        }
      />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pt-12 pb-20">
        {registrationOpen ? (
          <Suspense>
            <RegistrationForm />
          </Suspense>
        ) : (
          <div className="flex flex-col gap-3 border-2 border-(--brand-blue) bg-white px-6 py-10 text-center sm:px-12">
            <p className="text-2xl font-bold sm:text-3xl">{REGISTRATION_CLOSED_LABEL}</p>
            <p className="text-base sm:text-lg">
              Questions in the meantime?{" "}
              <a href={helpWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline">
                Ask us on WhatsApp
              </a>
              .
            </p>
          </div>
        )}
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
