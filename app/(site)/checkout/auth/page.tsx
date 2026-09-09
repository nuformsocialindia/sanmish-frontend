"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import AuthShell from "@/components/AuthShell";

// Amazon/Flipkart-style gate between "Buy Now" and checkout: a logged-out
// buyer picks sign in, create an account, or continue as a guest — instead
// of landing straight on the checkout form with no account context.
export default function CheckoutAuthPage() {
  const router = useRouter();
  const { user, hydrated } = useAuth();
  const { count } = useCart();

  // Already signed in (e.g. this URL was bookmarked, or opened in a second
  // tab after logging in elsewhere) — skip the gate entirely.
  useEffect(() => {
    if (hydrated && user) router.replace("/checkout");
  }, [hydrated, user, router]);

  if (hydrated && user) return null;

  return (
    <AuthShell
      eyebrow="Almost there"
      heading={<>Sign in for a <span className="grad-text">faster checkout</span></>}
      subtext="Track your order, save addresses and reorder in a click — or continue straight to checkout as a guest."
    >
      <div className="auth-card">
        <h2 className="auth-step-title">Continue to checkout</h2>
        <p className="auth-step-sub">
          {count > 0 ? `${count} item${count === 1 ? "" : "s"} ready in your cart.` : "Sign in or continue as a guest."}
        </p>

        <Link href="/login?next=/checkout" className="btn btn-primary form-submit" style={{ width: "100%" }}>
          Login to my account
        </Link>
        <Link href="/signup?next=/checkout" className="btn btn-ghost" style={{ width: "100%", marginTop: 12 }}>
          Create a free account
        </Link>

        <div className="auth-divider"><span>or</span></div>

        <button
          type="button"
          className="btn btn-secondary"
          style={{ width: "100%" }}
          onClick={() => router.push("/checkout")}
        >
          Continue as Guest
        </button>
        <p className="field-hint" style={{ textAlign: "center", marginTop: 10 }}>
          You can create an account later from your order confirmation.
        </p>
      </div>
    </AuthShell>
  );
}
