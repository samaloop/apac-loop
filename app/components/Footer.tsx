import Image from "next/image";
import Link from "next/link";
import { event, helpWhatsAppUrl } from "@/app/data/event";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/agenda", label: "Agenda" },
  { href: "/venue", label: "Venue & Bali" },
];

export default function Footer() {
  return (
    <footer className="bg-(--brand-blue) font-[family-name:var(--font-brand)] text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pt-12 pb-8">
        <div className="flex flex-col gap-8 border-b border-(--brand-rule) pb-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <Image src="/images/logo_apac.webp" alt="APAC" width={175} height={98} className="h-16 w-auto sm:h-20" />
            <p className="text-lg font-bold uppercase leading-snug sm:text-2xl">
              Coaching Conference 2027
              <br />
              {event.location}
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm uppercase">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="py-1 hover:text-(--brand-yellow)">
                {link.label}
              </Link>
            ))}
            <a href={helpWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="py-1 hover:text-(--brand-yellow)">
              Help
            </a>
          </nav>
        </div>
        <p className="text-sm text-(--brand-rule)">
          © 2027 {event.organizer}. Conference information is subject to confirmation.
        </p>
      </div>
    </footer>
  );
}
