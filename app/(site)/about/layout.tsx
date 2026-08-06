import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About SANMISH — Building India's Clean Energy Infrastructure Marketplace | Our Story, Mission & Team",
  description:
    "Learn about SANMISH — India's trusted B2B marketplace for CNG, CBG, Bio Gas and Hydrogen equipment. Our mission, values, journey, leadership team and commitment to verified, engineering-grade clean energy procurement.",
  keywords:
    "about SANMISH, clean energy marketplace India, CNG CBG hydrogen B2B, industrial gas procurement, company mission, leadership team",
  openGraph: {
    title: "About SANMISH — Clean Energy Infrastructure Marketplace",
    description:
      "Our story, mission and the team building India's B2B marketplace for alternative fuel infrastructure.",
    type: "website",
  },
};

export default function AboutLayout({
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
            "@type": "AboutPage",
            name: "About SANMISH",
            description:
              "About SANMISH — India's B2B Marketplace for Alternative Fuel Infrastructure (CNG, CBG, Bio Gas and Hydrogen equipment).",
            publisher: {
              "@type": "Organization",
              name: "SANMISH",
              areaServed: "IN",
              slogan: "Clean Energy Smarter Solutions",
              foundingDate: "2019",
            },
          }),
        }}
      />
      {children}
    </>
  );
}
