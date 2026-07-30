import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — SANMISH",
  description:
    "How SANMISH collects, uses, stores and protects your personal information across the marketplace, including your rights as a data principal.",
};

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
