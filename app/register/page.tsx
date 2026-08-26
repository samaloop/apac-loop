import type { Metadata } from "next";
import { event } from "../data/event";
import SectionHeading from "../components/SectionHeading";
import RegistrationForm from "../components/RegistrationForm";

export const metadata: Metadata = {
  title: "Register | Loop Coaching Summit 2026",
  description: "Register for Loop Coaching Summit 2026.",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-20">
      <SectionHeading
        eyebrow="Register"
        title="Save your seat"
        description={`${event.date} · ${event.location}. Fill in your details and complete payment to receive your ticket by email.`}
      />
      <RegistrationForm />
    </div>
  );
}
