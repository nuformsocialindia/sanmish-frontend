const COLORS: Record<string, string> = {
  delivered: "var(--color-accent-2-600)",
  in_transit: "var(--color-accent-500)",
  failed: "var(--color-neutral-700)",
  returned: "var(--color-neutral-400)",
};
const ORDER = ["delivered", "in_transit", "failed", "returned"];

export default function DonutChart({ data }: { data: Record<string, number> }) {
  const total = Object.values(data).reduce((a, b) => a + (Number(b) || 0), 0);
  const cx = 60, cy = 60, r = 52, hole = 30;
  let angle = -90;

  const segments = ORDER.filter((k) => k in data).map((key) => {
    const value = Number(data[key]) || 0;
    const frac = total > 0 ? value / total : 0;
    const start = angle;
    const end = angle + frac * 360;
    angle = end;
    return { key, value, start, end };
  });

  function arcPath(start: number, end: number) {
    const toXY = (deg: number) => {
      const rad = (deg * Math.PI) / 180;
      return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
    };
    const [x1, y1] = toXY(start);
    const [x2, y2] = toXY(end);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }

  return (
    <div className="adm-donut-wrap">
      <svg viewBox="0 0 120 120" width={120} height={120}>
        {segments.map((s) => (
          <path key={s.key} d={arcPath(s.start, s.end)} fill={COLORS[s.key] || "var(--color-neutral-400)"} />
        ))}
        <circle cx={cx} cy={cy} r={hole} fill="var(--color-surface)" />
        <text x={cx} y={cy - 2} textAnchor="middle" fontSize={20} fontFamily="var(--font-heading)" fill="var(--color-text)">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={9} letterSpacing="1px" fill="var(--color-neutral-600)">SHIPMENTS</text>
      </svg>
      <div className="adm-donut-legend">
        {segments.map((s) => (
          <div key={s.key} className="adm-donut-legend-row">
            <span className="adm-donut-dot" style={{ background: COLORS[s.key] || "var(--color-neutral-400)" }} />
            <span style={{ color: "var(--color-neutral-700)" }}>{s.key.replace(/_/g, " ")}</span>
            <b style={{ marginLeft: 4 }}>{s.value}</b>
          </div>
        ))}
      </div>
    </div>
  );
}
