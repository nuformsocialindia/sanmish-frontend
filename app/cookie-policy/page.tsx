import LegalPageLayout from "@/components/LegalPageLayout";

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout
      eyebrow="How we use cookies"
      title="Cookie Policy"
      intro="This Cookie Policy explains what cookies are, how SANMISH uses them, and the choices you have in controlling them."
      lastUpdated="20 July 2026"
      sections={[
        {
          id: "what-are-cookies",
          heading: "1. What Are Cookies",
          body: [
            "Cookies are small text files placed on your device when you visit a website. They help the site remember information about your visit — such as your login state, cart contents, and preferences — so you don't have to re-enter it every time you return.",
          ],
        },
        {
          id: "types-of-cookies",
          heading: "2. Types of Cookies We Use",
          body: [
            { list: [
              "Essential cookies — required for core functionality like staying logged in, keeping items in your cart, and completing checkout. These cannot be disabled without breaking key features.",
              "Preference cookies — remember choices like your selected category filters or recently viewed products.",
              "Analytics cookies — help us understand how the marketplace is used (pages visited, time on site, drop-off points) so we can improve it.",
              "Marketing cookies — used to measure the effectiveness of our newsletter and, where applicable, show relevant equipment recommendations.",
            ] },
          ],
        },
        {
          id: "why-we-use-cookies",
          heading: "3. Why We Use Cookies",
          body: [
            "We use cookies to keep the platform secure and functional, remember your session between page visits, understand aggregate usage patterns to improve performance, and — where you've opted in — personalise your experience and communications.",
          ],
        },
        {
          id: "third-party-cookies",
          heading: "4. Third-Party Cookies",
          body: [
            "Some cookies are set by third-party services we use, such as analytics providers and payment processors. These third parties have their own privacy and cookie practices, which we encourage you to review. SANMISH does not control third-party cookies directly.",
          ],
        },
        {
          id: "managing-cookies",
          heading: "5. Managing Your Cookie Preferences",
          body: [
            "Most browsers let you view, delete and block cookies through their settings menu. Because essential cookies are required for login, cart and checkout to function, blocking them will limit your ability to use the marketplace. You can also clear cookies at any time to reset stored preferences.",
          ],
        },
        {
          id: "changes-to-cookie-policy",
          heading: "6. Changes to This Policy",
          body: [
            "We may update this Cookie Policy as our use of cookies evolves. Any changes will be posted on this page with a revised \"Last updated\" date.",
          ],
        },
      ]}
    />
  );
}
