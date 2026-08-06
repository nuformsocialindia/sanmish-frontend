import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create an Account | SANMISH",
  description: "Create a free SANMISH account to source equipment, request quotations or sell to verified buyers.",
};

export default function SignupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
