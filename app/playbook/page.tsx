import { PLAYBOOK } from "@/lib/playbook";

export default function PlaybookPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="font-mono text-[11px] uppercase tracking-widest text-delete">Playbook</p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-ink md:text-5xl">
        The standard, in full.
      </h1>
      <p className="mt-4 max-w-2xl text-ink-soft">
        Every risk flag on <code className="rounded bg-paper-dim px-1.5 py-0.5 font-mono text-[13px]">/review</code>{" "}
        traces back to one of these eight clauses — nothing is scored against an
        opinion that isn&rsquo;t written down here.
      </p>

      <div className="mt-10 space-y-6">
        {PLAYBOOK.map((entry) => (
          <div key={entry.type} className="rounded-sm border border-ink/12 bg-white p-6">
            <h2 className="font-display text-xl font-semibold text-ink">{entry.label}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{entry.standard}</p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-wide text-ink-soft/70">
              {entry.redFlags.length} known red flags checked
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
