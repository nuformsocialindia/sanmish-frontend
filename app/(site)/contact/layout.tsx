import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact SANMISH — Sales, Support & Request a Quote | Clean Energy Marketplace",
  description:
    "Get in touch with SANMISH for quotations, seller onboarding, installation and support for CNG, CBG, Bio Gas and Hydrogen equipment. Head office in Pune, teams across India.",
  openGraph: {
    title: "Contact SANMISH — Sales, Support & Request a Quote | Clean Energy Marketplace",
    description:
      "Get in touch with SANMISH for quotations, seller onboarding, installation and support for CNG, CBG, Bio Gas and Hydrogen equipment. Head office in Pune, teams across India.",
    type: "website",
  },
};

export default function ContactLayout({
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
            "@type": "ContactPage",
            name: "SANMISH",
            areaServed: "IN",
            slogan: "Clean Energy Smarter Solutions",
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+91-90000-00000",
              contactType: "sales",
              email: "hello@sanmish.com",
            },
          }),
        }}
      />
      {children}
    </>
  );
}
