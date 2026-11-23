import Link from "next/link";
import type { ReactNode } from "react";
import { registrationOpen, REGISTRATION_CLOSED_LABEL } from "@/app/data/registration";

// Every "Register" call to action goes through this: a normal link while
// registration is open, an inert label with the same styling while closed.
export default function RegisterLink({
  href = "/register",
  className = "",
  onClick,
  children,
}: {
  href?: string;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  if (!registrationOpen) {
    return (
      <span aria-disabled="true" className={`${className} cursor-not-allowed opacity-60`}>
        {REGISTRATION_CLOSED_LABEL}
      </span>
    );
  }
  return (
    <Link href={href} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}
