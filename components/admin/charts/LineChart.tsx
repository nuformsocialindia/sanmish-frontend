"use client";
// Hand-rolled SVG line chart (no charting-library dependency) matching the
// Organic dashboard spec: 5 gridlines, accent line + area fill, point markers.
type Point = { date: string; total: number };

export default function LineChart({ points }: { points: Point[] }) {
  const width = 640;
  const height = 260;
  const padL = 56;
  const padR = 12;
  const padT = 16;
  const padB = 28;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const values = points.map((p) => Number(p.total) || 0);
  const max = Math.max(1, ...values);

  const x = (i: number) => padL + (points.length <= 1 ? 0 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => padT + innerH - (v / max) * innerH;

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(Number(p.total) || 0)}`).join(" ");
  const areaPath = points.length
    ? `${linePath} L ${x(points.length - 1)} ${padT + innerH} L ${x(0)} ${padT + innerH} Z`
    : "";

  const gridLines = Array.from({ length: 5 }, (_, i) => {
    const v = (max / 4) * (4 - i);
    return { y: padT + (innerH / 4) * i, label: v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : money(v) };
  });

  function money(v: number) {
    return "₹" + Math.round(v).toLocaleString("en-IN");
  }

  if (points.length === 0) {
    return <p style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>No sales data for this range yet.</p>;
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: 260 }} preserveAspectRatio="none">
      {gridLines.map((g, i) => (
        <g key={i}>
          <line x1={padL} x2={width - padR} y1={g.y} y2={g.y} stroke="var(--color-divider)" strokeWidth={1} />
          <text x={padL - 8} y={g.y + 3} fontSize={11} textAnchor="end" fill="var(--color-neutral-600)">{g.label}</text>
        </g>
      ))}
      <path d={areaPath} fill="var(--color-accent-200)" opacity={0.75} />
      <path d={linePath} fill="none" stroke="var(--color-accent)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(Number(p.total) || 0)} r={4.5} fill="var(--color-bg)" stroke="var(--color-accent)" strokeWidth={3} />
      ))}
      {points.map((p, i) => (
        (i === 0 || i === points.length - 1 || i % Math.ceil(points.length / 6) === 0) && (
          <text key={`lbl-${i}`} x={x(i)} y={height - 6} fontSize={11} textAnchor="middle" fill="var(--color-neutral-600)">
            {String(p.date).slice(5)}
          </text>
        )
      ))}
    </svg>
  );
}
