import Link from "next/link";
import Icon from "@/components/admin/Icon";

export default function Forbidden({ role, code = "ADMIN_FORBIDDEN" }: { role?: string; code?: string }) {
  return (
    <div className="card elev-sm adm-forbidden-card">
      <div className="adm-forbidden-icon"><Icon name="alert-circle" size={24} /></div>
      <h3 className="adm-forbidden-title">You don&apos;t have access to this section</h3>
      <p className="adm-forbidden-desc">
        {role ? `Your role (${role.replace(/_/g, " ").toLowerCase()}) ` : "Your role "}
        doesn&apos;t include this module. The server answered <code>{code}</code> — ask a super admin if you
        believe this is wrong.
      </p>
      <Link href="/admin" className="btn btn-secondary">Back to dashboard</Link>
    </div>
  );
}
