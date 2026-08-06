import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SANMISH — India's B2B Marketplace for Clean Energy Infrastructure | CNG, CBG, Bio Gas & Hydrogen Equipment",
  description:
    "SANMISH is India's trusted B2B marketplace for CNG, CBG, Bio Gas and Hydrogen fuel equipment. Buy, sell, request quotations and connect with verified manufacturers and industrial suppliers across India.",
  keywords:
    "CNG equipment, hydrogen refueling station, biogas plant, CBG compressor, gas dispenser, industrial gas B2B marketplace India, SANMISH",
  openGraph: {
    title: "SANMISH — Clean Energy Infrastructure Marketplace",
    description:
      "India's B2B marketplace for CNG, CBG, Bio Gas and Hydrogen fuel equipment.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "SANMISH",
              description:
                "India's B2B Marketplace for Alternative Fuel Infrastructure — CNG, CBG, Bio Gas and Hydrogen equipment.",
              areaServed: "IN",
              slogan: "Clean Energy Smarter Solutions",
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
