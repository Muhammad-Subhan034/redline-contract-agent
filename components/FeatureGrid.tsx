import Link from "next/link";
import Reveal from "./Reveal";

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
      <Reveal as="p" className="font-mono text-[11px] uppercase tracking-widest text-delete">
        What's actually running
      </Reveal>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {FEATURES.map((feature, i) => (
          <Reveal key={feature.href} delay={i * 0.05}>
            <Link
              href={feature.href}
              className="group block h-full rounded-sm border border-ink/12 bg-white p-7 transition-colors hover:border-ink/30"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl font-semibold text-ink">{feature.title}</h3>
                <span className="font-mono text-ink-soft transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{feature.body}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
