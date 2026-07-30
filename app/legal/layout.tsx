import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal & Compliance — SANMISH",
  description:
    "Legal notices for SANMISH — intellectual property, disclaimers, grievance redressal, and regulatory compliance information.",
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
