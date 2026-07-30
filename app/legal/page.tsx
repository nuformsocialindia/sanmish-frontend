import LegalPageLayout from "@/components/LegalPageLayout";

export default function LegalPage() {
  return (
    <LegalPageLayout
      eyebrow="Compliance & disclosures"
      title="Legal & Compliance"
      intro="This page consolidates SANMISH's regulatory disclosures, intellectual property notices, and grievance redressal information required under applicable Indian law."
      lastUpdated="20 July 2026"
      sections={[
        {
          id: "company-information",
          heading: "1. Company Information",
          body: [
            "SANMISH is operated as an online marketplace under the brand \"SANMISH — Clean Energy Smarter Solutions\", connecting buyers and verified sellers of CNG, CBG, Bio Gas and Hydrogen infrastructure equipment across India.",
            { list: [
              "Registered brand name: SANMISH",
              "Platform type: B2B e-commerce marketplace (intermediary)",
              "Primary contact: hello@sanmish.com · +91 90000 00000",
            ] },
          ],
        },
        {
          id: "intermediary-status",
          heading: "2. Intermediary Status",
          body: [
            "SANMISH operates as an intermediary under the Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020. We host listings submitted by independent Sellers and facilitate discovery, quotation and, where enabled, payment and logistics between buyers and Sellers. SANMISH is not a party to the contract of sale formed between a buyer and a Seller unless explicitly stated on a specific listing.",
          ],
        },
        {
          id: "intellectual-property-notice",
          heading: "3. Intellectual Property Notice",
          body: [
            "All trademarks, logos, and brand names displayed on this platform — including \"SANMISH\" and its logo — are the property of their respective owners. Product names, images, and technical specifications belong to their respective manufacturers or Sellers. Unauthorised reproduction, distribution, or use of any content on this platform without prior written permission is prohibited.",
            "If you believe content on SANMISH infringes your intellectual property rights, please write to hello@sanmish.com with details of the listing and your ownership claim, and we will investigate and take appropriate action, including removal of infringing content.",
          ],
        },
        {
          id: "disclaimer",
          heading: "4. Disclaimer of Warranties",
          body: [
            "Equipment specifications, pricing, availability and lead times are provided by Sellers and are subject to change without notice pending formal quotation. SANMISH makes reasonable efforts to verify Seller credentials before listing but does not independently test or certify listed equipment, and disclaims any warranty — express or implied — as to the fitness, quality, or regulatory compliance of any product beyond what is represented by the Seller.",
          ],
        },
        {
          id: "regulatory-compliance",
          heading: "5. Regulatory Compliance",
          body: [
            "Equipment involving compressed and liquefied gases (CNG, CBG, Bio Gas) is subject to regulation by authorities including the Petroleum and Explosives Safety Organisation (PESO) and relevant state pollution control boards. Sellers are solely responsible for ensuring their listed equipment complies with all applicable safety, environmental and industry certifications (such as PESO approval and ISO 9001, where indicated on a listing). Buyers are responsible for obtaining any site-specific regulatory approvals required for installation and operation.",
          ],
        },
        {
          id: "grievance-redressal",
          heading: "6. Grievance Redressal Mechanism",
          body: [
            "In compliance with the Consumer Protection (E-Commerce) Rules, 2020 and the Information Technology Act, 2000, SANMISH has appointed a Grievance Officer to address complaints relating to the platform, listings, or conduct of Sellers.",
            { list: [
              "Grievance Officer: Data Protection & Compliance Team, SANMISH",
              "Email: hello@sanmish.com",
              "Acknowledgement: within 48 hours of receipt",
              "Resolution: within 15 business days of acknowledgement",
            ] },
            "You may also raise a concern using our Contact Us form, selecting \"Grievance / Complaint\" as the subject.",
          ],
        },
        {
          id: "limitation-and-indemnity",
          heading: "7. Limitation of Liability & Indemnity",
          body: [
            "SANMISH's liability in connection with any transaction facilitated through the platform is limited as described in our Terms of Service. You agree to indemnify and hold SANMISH harmless from any claims, damages, or expenses arising from your breach of these disclosures, misuse of the platform, or a dispute between you and a Seller.",
          ],
        },
        {
          id: "governing-law-legal",
          heading: "8. Governing Law",
          body: [
            "These legal disclosures are governed by the laws of India, and any disputes are subject to the exclusive jurisdiction of the courts at New Delhi, India, as further detailed in our Terms of Service.",
          ],
        },
      ]}
    />
  );
}
