import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy — SANMISH",
  description:
    "How SANMISH uses cookies and similar technologies, the types of cookies we set, and how to manage your preferences.",
};

export default function CookiePolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
