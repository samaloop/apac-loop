import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | APAC Coaching Conference 2027",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
