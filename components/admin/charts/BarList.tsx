import { money } from "@/lib/admin/format";

export default function BarList({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div>
      {items.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>No revenue data yet.</p>
      ) : items.map((item, i) => (
        <div key={item.label} className="adm-barlist-row">
          <div className="adm-barlist-top">
            <span>{item.label}</span>
            <b>{money(item.value)}</b>
          </div>
          <div className="adm-barlist-track">
            <div
              className="adm-barlist-fill"
              style={{
                width: `${Math.max(4, (item.value / max) * 100)}%`,
                background: i % 2 === 0 ? "var(--color-accent-500)" : "var(--color-accent-2-500)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
