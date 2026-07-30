import LegalPageLayout from "@/components/LegalPageLayout";

export default function ShippingReturnsPage() {
  return (
    <LegalPageLayout
      eyebrow="Delivery & aftersales"
      title="Shipping & Returns Policy"
      intro="This page explains delivery timelines, shipping charges, order tracking, cancellations, returns and warranty claims for equipment ordered through SANMISH."
      lastUpdated="20 July 2026"
      sections={[
        {
          id: "shipping-overview",
          heading: "1. Shipping Overview",
          body: [
            "Equipment listed on SANMISH is shipped directly by the Seller or their designated logistics partner, with tracked dispatch coordinated across our PAN India network of 28+ states. Because most listings are industrial equipment made to order or shipped from regional warehouses, delivery timelines vary by product and are shown on each listing.",
          ],
        },
        {
          id: "delivery-timelines",
          heading: "2. Delivery Timelines",
          body: [
            "Standard equipment typically ships within 7–14 business days of order confirmation, as shown on the product page. Made-to-order or bulk (21+ unit) orders may take longer and will have a confirmed lead time included in the Seller's formal quotation. Delivery estimates exclude installation, commissioning, or site-readiness delays outside SANMISH's control.",
          ],
        },
        {
          id: "shipping-charges",
          heading: "3. Shipping Charges",
          body: [
            "Many listings are eligible for free shipping, as indicated on the product page (\"Eligible for FREE SHIPPING\"). Where shipping is chargeable, the exact charge is calculated based on delivery location, weight and equipment dimensions, and shown at checkout before you confirm your order — never added silently afterward.",
          ],
        },
        {
          id: "order-tracking",
          heading: "4. Order Tracking",
          body: [
            "Once your order is dispatched, you can track its status from My Account → Orders. You'll also receive SMS/email updates at key milestones — order confirmed, dispatched, out for delivery, and delivered.",
          ],
        },
        {
          id: "cancellations",
          heading: "5. Cancellations",
          body: [
            "Orders can be cancelled free of charge before they are dispatched, from My Account → Orders → Cancel Order. Once equipment has shipped, cancellation may no longer be possible, or may involve a restocking or logistics fee — this is confirmed on the specific listing and at checkout. Made-to-order equipment where fabrication has already begun is generally non-cancellable.",
          ],
        },
        {
          id: "returns-eligibility",
          heading: "6. Returns Eligibility",
          body: [
            "Where indicated on the product page (\"7 Days Return Policy\"), standard equipment can be returned within 7 days of delivery if it is unused, in its original packaging, and free of installation or physical damage. The following are typically not eligible for return unless defective on arrival:",
            { list: [
              "Made-to-order or custom-fabricated equipment.",
              "Equipment that has been installed, commissioned, or connected to a gas/power supply.",
              "Consumables, seals, gaskets, and other single-use parts.",
              "Products explicitly marked \"Non-Returnable\" on the listing or quotation.",
            ] },
          ],
        },
        {
          id: "return-process",
          heading: "7. Return Process & Refunds",
          body: [
            "To initiate a return, go to My Account → Orders → Request Return, or contact us with your order ID. Once the Seller confirms and the item is received back in eligible condition, refunds are processed to your original payment method within 7–10 business days. For bank transfer or RFQ-based orders, refund timelines are confirmed directly by our team.",
          ],
        },
        {
          id: "damaged-or-defective",
          heading: "8. Damaged or Defective Items",
          body: [
            "If equipment arrives damaged or with a manufacturing defect, report it within 48 hours of delivery with photos via My Account → Orders → Report an Issue, or by contacting our support team. We'll coordinate a replacement, repair, or refund with the Seller at no cost to you.",
          ],
        },
        {
          id: "warranty-claims",
          heading: "9. Warranty Claims",
          body: [
            "Manufacturer warranty terms (typically 1 year unless otherwise stated on the listing) are honoured directly by the Seller. To raise a warranty claim, contact SANMISH support with your order ID and a description of the issue — we'll route the claim to the Seller and follow up on your behalf until it's resolved.",
          ],
        },
      ]}
    />
  );
}
