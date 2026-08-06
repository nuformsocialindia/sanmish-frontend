import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Cart | SANMISH",
  description: "Review equipment added to your SANMISH cart and request a bulk quotation.",
};

export default function CartLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
