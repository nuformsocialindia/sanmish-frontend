import "./admin.css";
import { AdminAuthProvider } from "@/lib/admin/auth-context";
import { AdminToastProvider } from "@/components/admin/Toast";

export const metadata = {
  title: "SANMISH Admin",
  description: "Internal management console for SANMISH.",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminToastProvider>{children}</AdminToastProvider>
    </AdminAuthProvider>
  );
}
