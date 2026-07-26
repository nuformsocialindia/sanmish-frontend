import type { Metadata } from "next";
import AccountShell from "@/components/AccountShell";

export const metadata: Metadata = {
  title: "My Account | SANMISH",
  description: "Manage your SANMISH orders, addresses, payment methods and wishlist.",
};

export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AccountShell>{children}</AccountShell>;
}
