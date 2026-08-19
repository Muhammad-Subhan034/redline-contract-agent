export default function StatTile({
  label,
  value,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "critical";
  hint?: string;
}) {
  const toneClass =
    tone === "good" ? "text-risk-low" : tone === "critical" ? "text-risk-high" : "text-ink";

  return (
    <div className="rounded-sm border border-ink/12 bg-white p-5">
      <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">{label}</p>
      <p className={`mt-2 font-body text-3xl font-semibold ${toneClass}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}
