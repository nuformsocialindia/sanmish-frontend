import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in to continue | SANMISH",
  description: "Sign in or continue as a guest to complete your SANMISH order.",
};

export default function CheckoutAuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
