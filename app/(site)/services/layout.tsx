import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SANMISH Services — Installation, Commissioning, AMC & Turnkey Clean Energy Projects",
  description:
    "Engineering services for CNG, CBG, Bio Gas and Hydrogen infrastructure — equipment supply, plant installation, commissioning, AMC, spare parts and turnkey projects across India.",
  openGraph: {
    title: "SANMISH Services — Installation, Commissioning, AMC & Turnkey Clean Energy Projects",
    description:
      "Engineering services for CNG, CBG, Bio Gas and Hydrogen infrastructure — equipment supply, plant installation, commissioning, AMC, spare parts and turnkey projects across India.",
    type: "website",
  },
};

export default function ServicesLayout({
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
            "@type": "Service",
            name: "SANMISH",
            areaServed: "IN",
            slogan: "Clean Energy Smarter Solutions",
            serviceType: ["Installation", "Commissioning", "AMC", "Turnkey EPC"],
          }),
        }}
      />
      {children}
    </>
  );
}
