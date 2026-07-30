import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center — SANMISH",
  description:
    "Answers to common questions about orders, RFQs, payments, shipping, returns, becoming a seller, and your SANMISH account.",
};

export default function HelpCenterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
