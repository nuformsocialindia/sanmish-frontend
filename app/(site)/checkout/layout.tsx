import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | SANMISH",
  description: "Confirm your delivery details and submit a bulk quotation request for items in your cart.",
};

export default function CheckoutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
