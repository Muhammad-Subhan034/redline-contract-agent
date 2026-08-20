import Link from "next/link";
import Reveal from "./Reveal";
import TiltCard from "./TiltCard";

const FEATURES = [
  {
    href: "/review",
    title: "Clause review",
    body: "Paste or pick a sample contract — every clause gets classified, risk-scored, and redlined.",
  },
  {
    href: "/playbook",
    title: "Standard playbook",
    body: "The actual reference clauses every suggestion is checked against — nothing hidden behind the model.",
  },
  {
    href: "/evals",
    title: "Classifier evals",
    body: "Clause-type accuracy on a genuinely held-out set, with a real confusion matrix.",
  },
  {
    href: "/audit",
    title: "Review log",
    body: "Every contract run, every flag raised — a record you could actually hand to a partner.",
  },
];

export default function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <Reveal
        as="p"
        variant="clip-wipe"
        className="font-mono text-[11px] uppercase tracking-widest text-delete"
      >
        What's actually running
      </Reveal>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {FEATURES.map((feature, i) => (
          <Reveal key={feature.href} variant="scale-in" delay={i * 0.05}>
            <TiltCard
              glow={i % 2 === 0 ? "var(--insert)" : "var(--delete)"}
              className="h-full overflow-hidden rounded-sm border border-ink/12 bg-white"
            >
              <Link href={feature.href} className="block h-full p-7">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-semibold text-ink">{feature.title}</h3>
                  <span className="font-mono text-ink-soft transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{feature.body}</p>
              </Link>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
