import "./vendor.css";
import { VendorAuthProvider } from "@/lib/vendor/auth-context";
import { VendorToastProvider } from "@/components/vendor/Toast";

export const metadata = {
  title: "SANMISH Vendor Portal",
  description: "Manage your products, orders and settlements on SANMISH.",
  robots: { index: false, follow: false },
};

export default function VendorRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <VendorAuthProvider>
      <VendorToastProvider>{children}</VendorToastProvider>
    </VendorAuthProvider>
  );
}
