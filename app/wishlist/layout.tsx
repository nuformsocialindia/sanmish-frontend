import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Wishlist | SANMISH",
  description: "Equipment you've saved for later on SANMISH.",
};

export default function WishlistLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
