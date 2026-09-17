"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import type { ProductDetail } from "@/lib/productLookup";

export default function SimilarProductCard({
  product,
  compact = true,
}: {
  product: ProductDetail;
  // compact=true: fixed-width card for a horizontal scroll rail (product
  // detail page's "Similar Products"). compact=false: a plain grid card,
  // full-width within its CSS Grid cell (category pages, etc).
  compact?: boolean;
}) {
  const { addItem } = useCart();
  const { isWishlisted, toggleItem } = useWishlist();
  const wishlisted = isWishlisted(product.slug);
  const [added, setAdded] = useState(false);

  return (
    <div className={`prod${compact ? " pdp-similar-card" : ""}`}>
      <Link href={`/products/${product.slug}`} className="prod-card-link" aria-hidden="true" tabIndex={-1} />
      <div className="prod-img">
        <span dangerouslySetInnerHTML={{ __html: product.icon }} />
        <span className="prod-badge">{product.badge}</span>
        <button
          type="button"
          className={`prod-wishlist${wishlisted ? " active" : ""}`}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          data-tooltip={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          onClick={() => toggleItem(product)}
        >
          <svg viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "#fff"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      <div className="prod-body">
        <h3>{product.title}</h3>
        <div className="prod-cat">{product.category}</div>
        <div className="prod-seller">
          <span className="sd">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
          </span>
          {product.seller}
        </div>
        <div className="prod-foot">
          <div className="prod-price">
            <small>Starting from</small>
            <b>{product.priceLabel}</b>
          </div>
          <div className="prod-actions">
            <Link href={`/products/${product.slug}`} className="mini-btn o">Details</Link>
            <button
              type="button"
              className="mini-btn g"
              onClick={() => {
                addItem(product, 1);
                setAdded(true);
                setTimeout(() => setAdded(false), 1500);
              }}
            >
              {added ? "Added" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
