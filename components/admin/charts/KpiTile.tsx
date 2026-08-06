export default function KpiTile({ label, value, delta, tone = "neutral" }: {
  label: string; value: string; delta?: string; tone?: "good" | "attn" | "neutral";
}) {
  return (
    <div className="card elev-sm adm-kpi-tile">
      <span className="adm-kpi-label">{label}</span>
      <span className="adm-kpi-value">{value}</span>
      {delta && <span className={`adm-kpi-delta ${tone}`}>{delta}</span>}
    </div>
  );
}
