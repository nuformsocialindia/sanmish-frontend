import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Returns Policy — SANMISH",
  description:
    "Delivery timelines, shipping charges, order tracking, cancellations, returns and warranty claims for equipment ordered through SANMISH.",
};

export default function ShippingReturnsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
