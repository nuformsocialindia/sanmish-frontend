import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — SANMISH",
  description:
    "The terms and conditions governing your use of the SANMISH marketplace, including buyer and seller responsibilities, RFQs, orders and payments.",
};

export default function TermsOfServiceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
