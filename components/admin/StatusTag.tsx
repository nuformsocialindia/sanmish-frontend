import { displayStatus, toneClass } from "@/lib/admin/format";

export default function StatusTag({ status }: { status: string | null | undefined }) {
  return <span className={toneClass(status)}>{displayStatus(status)}</span>;
}
