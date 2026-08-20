import Reveal from "./Reveal";

const STEPS = [
  {
    n: "01",
    title: "Split into clauses",
    body: "The contract is parsed into numbered sections — the same unit a reviewer actually reads.",
  },
  {
    n: "02",
    title: "Classify each one",
    body: "A trained model identifies the clause type — indemnification, liability, termination — from its text alone.",
  },
  {
    n: "03",
    title: "Compare to playbook",
    body: "Each clause is checked against its matching standard for known red-flag language.",
  },
  {
    n: "04",
    title: "Draft the redline",
    body: "A suggested edit is generated and linked to the exact playbook clause it's drawn from.",
  },
];

export default function ProcessSection() {
  return (
    <section className="border-t border-ink/12 bg-paper-dim/60">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <Reveal
          as="p"
          variant="clip-wipe"
          className="font-mono text-[11px] uppercase tracking-widest text-delete"
        >
          How it reviews
        </Reveal>
        <div className="mt-10 grid gap-px overflow-hidden rounded-sm border border-ink/12 bg-ink/10 md:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal
              key={step.n}
              variant={i % 2 === 0 ? "fade-up" : "scale-in"}
              delay={i * 0.08}
              className="bg-paper p-6"
            >
              <span className="font-display text-3xl font-semibold text-ink/25">{step.n}</span>
              <h3 className="mt-4 font-display text-xl font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
