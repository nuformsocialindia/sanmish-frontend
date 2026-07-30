import LegalPageLayout from "@/components/LegalPageLayout";

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      eyebrow="Please read carefully"
      title="Terms of Service"
      intro="These Terms of Service ('Terms') govern your access to and use of the SANMISH marketplace, website, and related services. By creating an account or using SANMISH, you agree to these Terms."
      lastUpdated="20 July 2026"
      sections={[
        {
          id: "acceptance",
          heading: "1. Acceptance of Terms",
          body: [
            "By accessing or using SANMISH, you confirm that you are entering into these Terms on behalf of a business entity you are authorised to represent, or as an individual authorised to procure equipment on behalf of your organisation. If you do not agree to these Terms, please do not use the platform.",
          ],
        },
        {
          id: "the-marketplace-model",
          heading: "2. The Marketplace Model",
          body: [
            "SANMISH is a B2B marketplace that connects buyers with independent, third-party manufacturers and suppliers ('Sellers') of clean energy and alternative fuel infrastructure equipment. SANMISH itself does not manufacture or, in most cases, directly sell the listed equipment.",
            { list: [
              "Product listings, pricing, specifications and lead times are provided by Sellers and may be updated or corrected upon quotation.",
              "Quotations issued in response to an RFQ (Request for Quotation) are offers made by the Seller, not by SANMISH, unless explicitly stated otherwise.",
              "SANMISH facilitates discovery, communication, and — where enabled — payment and logistics coordination between buyers and Sellers, and verifies Seller documentation before listing.",
            ] },
          ],
        },
        {
          id: "accounts",
          heading: "3. Accounts and Eligibility",
          body: [
            "You must be at least 18 years old and legally capable of entering into binding contracts to create an account. You are responsible for maintaining the confidentiality of your login credentials and OTP, and for all activity that occurs under your account. Notify us immediately at hello@sanmish.com if you suspect unauthorised use of your account.",
          ],
        },
        {
          id: "rfqs-and-orders",
          heading: "4. RFQs, Quotations and Orders",
          body: [
            "Submitting an RFQ or adding items to your cart does not constitute a binding order. An order is confirmed only once a Seller has issued a formal quotation and you have accepted it and completed the checkout process, or as otherwise communicated by our team in writing.",
            { list: [
              "Prices displayed on listings are indicative starting prices and may vary based on quantity, delivery location and specification changes confirmed at the quotation stage.",
              "Bulk order (21+ units) pricing is provided on request and is subject to a separate quotation.",
              "SANMISH reserves the right to cancel or refuse any order it reasonably believes to be fraudulent, erroneous, or in violation of these Terms.",
            ] },
          ],
        },
        {
          id: "payments-and-taxes",
          heading: "5. Payments and Taxes",
          body: [
            "All prices are listed in Indian Rupees (INR) and are inclusive of applicable GST unless stated otherwise. Final pricing, applicable taxes, and shipping charges are confirmed at checkout or in the Seller's formal quotation. You are responsible for providing accurate GSTIN and billing details for invoicing purposes.",
          ],
        },
        {
          id: "cancellations-returns",
          heading: "6. Cancellations, Returns and Warranty",
          body: [
            "Cancellation windows, return eligibility (including the 7-day return policy shown on product pages, where applicable), and warranty terms are set by the Seller for each product and are confirmed at the time of order. Industrial and made-to-order equipment may be non-cancellable or non-returnable once fabrication has begun — this will be communicated before you confirm an order.",
          ],
        },
        {
          id: "seller-obligations",
          heading: "7. Seller Obligations",
          body: [
            "Sellers listing equipment on SANMISH represent that they hold all necessary licenses, certifications and legal authority to manufacture and sell the listed equipment, that their listings are accurate, and that they will honour quotations issued to buyers through the platform in good faith.",
          ],
        },
        {
          id: "acceptable-use",
          heading: "8. Acceptable Use",
          body: [
            "You agree not to:",
            { list: [
              "Use the platform for any unlawful purpose or in violation of any applicable regulation.",
              "Post false, misleading or infringing listings, reviews or communications.",
              "Attempt to circumvent the platform to avoid applicable fees, or to solicit users off-platform to evade these Terms.",
              "Interfere with or disrupt the integrity or performance of the platform, including through scraping, reverse engineering, or unauthorised automated access.",
            ] },
          ],
        },
        {
          id: "intellectual-property",
          heading: "9. Intellectual Property",
          body: [
            "The SANMISH name, logo, website design and platform software are the property of SANMISH and protected by applicable intellectual property laws. Product images, brand names and specifications belong to their respective Sellers or manufacturers. Nothing in these Terms grants you a licence to use SANMISH's trademarks without prior written consent.",
          ],
        },
        {
          id: "limitation-of-liability",
          heading: "10. Limitation of Liability",
          body: [
            "To the maximum extent permitted by law, SANMISH acts as an intermediary and is not liable for the quality, safety, legality, or performance of equipment listed by Sellers, or for any indirect, incidental or consequential damages arising from your use of the platform or a transaction with a Seller. SANMISH's total liability for any claim arising out of these Terms shall not exceed the platform service fee (if any) paid by you for the relevant transaction.",
          ],
        },
        {
          id: "termination",
          heading: "11. Termination",
          body: [
            "You may close your account at any time from your Account settings. SANMISH may suspend or terminate your access if we reasonably believe you have violated these Terms, engaged in fraudulent activity, or posed a risk to other users or the platform.",
          ],
        },
        {
          id: "governing-law",
          heading: "12. Governing Law and Dispute Resolution",
          body: [
            "These Terms are governed by the laws of India. Any dispute arising out of or relating to these Terms or your use of SANMISH shall be subject to the exclusive jurisdiction of the courts at New Delhi, India, subject to first attempting good-faith resolution through our Contact Us / grievance process.",
          ],
        },
        {
          id: "changes-to-terms",
          heading: "13. Changes to These Terms",
          body: [
            "We may revise these Terms from time to time. Continued use of SANMISH after changes are posted constitutes your acceptance of the revised Terms. Material changes will be communicated via email or an in-app notice ahead of taking effect where practicable.",
          ],
        },
      ]}
    />
  );
}
