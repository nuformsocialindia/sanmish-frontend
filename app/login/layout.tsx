import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | SANMISH",
  description: "Log in to your SANMISH account to manage RFQs, orders and your wishlist.",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
