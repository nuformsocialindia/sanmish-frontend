import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section" style={{ paddingTop: 60 }}>
      <div className="wrap">
        <div className="empty-state" style={{ maxWidth: 560, margin: "0 auto" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <h3 style={{ fontSize: "1.4rem" }}>404 — Page not found</h3>
          <p>
            The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved. Try heading back home,
            browsing our equipment catalogue, or searching for what you need.
          </p>
          <div className="cta-btns" style={{ justifyContent: "center", marginTop: 24 }}>
            <Link href="/" className="btn btn-primary">Go to Homepage</Link>
            <Link href="/products" className="btn btn-ghost">Browse Products</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
