"use client";
import Link from "next/link";
import { useWishlist } from "@/lib/wishlist-context";
import { useCart } from "@/lib/cart-context";

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  return (
    <section className="section" style={{ paddingTop: 40 }}>
      <div className="wrap">
        <div className="crumbs">
          <Link href="/">Home</Link>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span className="cur">Wishlist</span>
        </div>

        <div className="section-head" style={{ margin: "0 0 32px", textAlign: "left", maxWidth: "none" }}>
          <h2 style={{ margin: "10px 0 0" }}>Your <span className="grad-text">Wishlist</span></h2>
          <p>Equipment you&rsquo;ve saved for later — move it to your cart whenever you&rsquo;re ready.</p>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <h3>Your wishlist is empty</h3>
            <p>Tap the heart icon on any product page to save it here.</p>
            <Link href="/products" className="btn btn-primary" style={{ marginTop: 20 }}>
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="prod-grid">
            {items.map((item) => (
              <div key={item.slug} className="prod">
                <Link href={`/products/${item.slug}`} className="prod-card-link" aria-hidden="true" tabIndex={-1} />
                <div className="prod-img">
                  <span dangerouslySetInnerHTML={{ __html: item.icon }} />
                  <span className="prod-badge">{item.badge}</span>
                  <button
                    type="button"
                    className="prod-verify wishlist-remove"
                    onClick={() => removeItem(item.slug)}
                    aria-label="Remove from wishlist"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="prod-body">
                  <h3>{item.title}</h3>
                  <div className="prod-cat">{item.category}</div>
                  <div className="prod-seller">
                    <span className="sd">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      </svg>
                    </span>
                    {item.seller}
                  </div>
                  <div className="prod-foot">
                    <div className="prod-price">
                      <small>Starting from</small>
                      <b>{item.priceLabel}</b>
                    </div>
                    <div className="prod-actions">
                      <button
                        type="button"
                        className="mini-btn g"
                        onClick={() => {
                          addItem(
                            {
                              slug: item.slug,
                              title: item.title,
                              category: item.category,
                              seller: item.seller,
                              priceLabel: item.priceLabel,
                              priceValue: item.priceValue,
                              badge: item.badge,
                              icon: item.icon,
                            },
                            1
                          );
                          removeItem(item.slug);
                        }}
                      >
                        Move to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
