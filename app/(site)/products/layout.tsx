import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Products — CNG, CBG & Bio Gas Equipment | SANMISH",
  description:
    "Browse verified CNG, CBG and Bio Gas equipment listings on SANMISH. Filter by category, brand and price, and request quotations from verified manufacturers across India.",
  keywords:
    "CNG equipment, biogas plant, CBG compressor, gas dispenser, industrial gas B2B marketplace India, SANMISH",
  openGraph: {
    title: "SANMISH — Clean Energy Infrastructure Marketplace",
    description: "India's B2B marketplace for CNG, CBG and Bio Gas fuel equipment.",
    type: "website",
  },
};

export default function ProductsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
