import LegalPageLayout from "@/components/LegalPageLayout";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      eyebrow="Your data, protected"
      title="Privacy Policy"
      intro="This policy explains what information SANMISH collects when you use our marketplace, why we collect it, and the choices and rights you have over your data."
      lastUpdated="20 July 2026"
      sections={[
        {
          id: "information-we-collect",
          heading: "1. Information We Collect",
          body: [
            "We collect information you provide directly to us, information collected automatically as you use the platform, and information from third parties such as payment processors and verification services.",
            { list: [
              "Account information — name, company name, email address, mobile number, GSTIN, and billing/delivery addresses.",
              "Transaction information — RFQs raised, quotations received, orders placed, cart and wishlist contents, and payment method metadata (we do not store full card numbers).",
              "Usage information — pages viewed, search queries, device type, browser, IP address, and approximate location derived from IP.",
              "Communications — messages sent through Contact Us, enquiry forms, or customer support channels.",
            ] },
          ],
        },
        {
          id: "how-we-use-information",
          heading: "2. How We Use Your Information",
          body: [
            "We use the information we collect to operate, maintain and improve the marketplace, and specifically to:",
            { list: [
              "Create and manage your buyer or seller account.",
              "Route RFQs to relevant verified sellers and share your requirement details with the sellers you choose to contact.",
              "Process orders, generate GST-compliant invoices, and coordinate delivery and installation.",
              "Send transactional communications — OTPs, order confirmations, quotation updates, and delivery status.",
              "Send optional marketing communications about new listings, pricing changes and market insights, which you can opt out of at any time.",
              "Detect, investigate and prevent fraud, abuse and security incidents.",
              "Comply with applicable tax, accounting and legal obligations.",
            ] },
          ],
        },
        {
          id: "sharing-of-information",
          heading: "3. How We Share Information",
          body: [
            "SANMISH is a marketplace that connects buyers with independent, verified sellers. We share only what's necessary for a transaction to proceed:",
            { list: [
              "With sellers — your company name, contact details and requirement details are shared with sellers you send an RFQ to, so they can prepare a quotation.",
              "With logistics and installation partners — delivery address and contact information, solely to fulfil an order you've placed.",
              "With payment processors — transaction details required to process payments securely; SANMISH does not store your full card or bank details.",
              "With service providers — cloud hosting, analytics and email/SMS delivery vendors bound by confidentiality obligations.",
              "For legal reasons — where required by law, court order, or to protect the rights, property or safety of SANMISH, our users, or the public.",
            ] },
            "We do not sell your personal information to third parties.",
          ],
        },
        {
          id: "cookies",
          heading: "4. Cookies and Similar Technologies",
          body: [
            "We use cookies and similar technologies to keep you signed in, remember your cart and wishlist, understand how the marketplace is used, and improve performance. You can control cookies through your browser settings; disabling essential cookies may affect core features like checkout and login.",
          ],
        },
        {
          id: "data-retention",
          heading: "5. Data Retention",
          body: [
            "We retain your information for as long as your account is active or as needed to provide you services, comply with our legal obligations (including tax and accounting requirements, typically up to 8 years for transaction records), resolve disputes, and enforce our agreements. You may request deletion of your account data at any time, subject to these retention obligations.",
          ],
        },
        {
          id: "data-security",
          heading: "6. Data Security",
          body: [
            "We use industry-standard technical and organisational safeguards — including encryption in transit, access controls, and regular security reviews — to protect your information against unauthorised access, alteration, disclosure or destruction. No method of transmission or storage is 100% secure, and we encourage you to use a strong, unique password for your account.",
          ],
        },
        {
          id: "your-rights",
          heading: "7. Your Rights and Choices",
          body: [
            "Subject to applicable law, you have the right to:",
            { list: [
              "Access the personal information we hold about you.",
              "Correct inaccurate or incomplete information via your Account settings.",
              "Request deletion of your account and associated personal data.",
              "Withdraw consent for marketing communications at any time.",
              "Raise a grievance regarding the handling of your personal data (see Section 9).",
            ] },
            "To exercise any of these rights, contact us using the details below.",
          ],
        },
        {
          id: "childrens-privacy",
          heading: "8. Children's Privacy",
          body: [
            "SANMISH is a B2B marketplace intended for business use and is not directed at individuals under the age of 18. We do not knowingly collect personal information from minors.",
          ],
        },
        {
          id: "grievance-officer",
          heading: "9. Grievance Officer",
          body: [
            "In accordance with the Information Technology Act, 2000 and rules made thereunder, the contact details of the Grievance Officer are provided below. Any complaints or concerns regarding the processing of your personal information may be addressed to:",
            { list: [
              "Grievance Officer: Data Protection Team, SANMISH",
              "Email: hello@sanmish.com",
              "Response time: within 15 business days of receiving a written complaint",
            ] },
          ],
        },
        {
          id: "changes-to-policy",
          heading: "10. Changes to This Policy",
          body: [
            "We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. We will post the updated policy on this page with a revised \"Last updated\" date, and for material changes, we will provide additional notice such as an email or an in-app banner.",
          ],
        },
      ]}
    />
  );
}
