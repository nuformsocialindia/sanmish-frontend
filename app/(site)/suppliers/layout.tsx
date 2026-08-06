import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SANMISH Suppliers — Verified CNG, CBG, Bio Gas & Hydrogen Equipment Manufacturers",
  description:
    "Browse India's network of 500+ verified suppliers, manufacturers and EPC partners for CNG, CBG, Bio Gas and Hydrogen equipment. Send one RFQ, receive multiple quotes.",
  openGraph: {
    title: "SANMISH Suppliers — Verified CNG, CBG, Bio Gas & Hydrogen Equipment Manufacturers",
    description:
      "Browse India's network of 500+ verified suppliers, manufacturers and EPC partners for CNG, CBG, Bio Gas and Hydrogen equipment. Send one RFQ, receive multiple quotes.",
    type: "website",
  },
};

export default function SuppliersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "SANMISH Suppliers",
            about: "Verified suppliers of CNG, CBG, Bio Gas and Hydrogen equipment",
            areaServed: "IN",
          }),
        }}
      />
      {children}
    </>
  );
}
