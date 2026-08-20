import { PLAYBOOK } from "@/lib/playbook";
import Reveal from "@/components/Reveal";

export default function PlaybookPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <Reveal as="p" variant="clip-wipe" className="font-mono text-[11px] uppercase tracking-widest text-delete">
        Playbook
      </Reveal>
      <Reveal as="h1" delay={0.08} className="mt-3 font-display text-4xl font-semibold text-ink md:text-5xl">
        The standard, in full.
      </Reveal>
      <Reveal as="p" delay={0.14} className="mt-4 max-w-2xl text-ink-soft">
        Every risk flag on <code className="rounded bg-paper-dim px-1.5 py-0.5 font-mono text-[13px]">/review</code>{" "}
        traces back to one of these eight clauses — nothing is scored against an
        opinion that isn&rsquo;t written down here.
      </Reveal>

      <div className="mt-10 space-y-6">
        {PLAYBOOK.map((entry, i) => (
          <Reveal
            key={entry.type}
            variant={i % 2 === 0 ? "fade-up" : "scale-in"}
            delay={Math.min(i * 0.05, 0.3)}
            className="group rounded-sm border border-ink/12 bg-white p-6 transition-colors duration-300 hover:border-insert/40"
          >
            <h2 className="font-display text-xl font-semibold text-ink">{entry.label}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{entry.standard}</p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-wide text-ink-soft/70">
              {entry.redFlags.length} known red flags checked
            </p>
          </Reveal>
        ))}
      </div>
    </main>
  );
}
