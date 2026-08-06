import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { AuthProvider } from "@/lib/auth-context";
import { OrdersProvider } from "@/lib/orders-context";
import { AddressProvider } from "@/lib/address-context";
import { PaymentProvider } from "@/lib/payment-context";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AddressProvider>
        <PaymentProvider>
          <OrdersProvider>
            <WishlistProvider>
              <CartProvider>
                <Header />
                <main>{children}</main>
                <Footer />
                <ChatWidget />
              </CartProvider>
            </WishlistProvider>
          </OrdersProvider>
        </PaymentProvider>
      </AddressProvider>
    </AuthProvider>
  );
}
