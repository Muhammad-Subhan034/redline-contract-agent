import ReviewForm from "@/components/ReviewForm";
import Reveal from "@/components/Reveal";

export default function ReviewPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <Reveal as="p" variant="clip-wipe" className="font-mono text-[11px] uppercase tracking-widest text-delete">
        Review
      </Reveal>
      <Reveal as="h1" delay={0.08} className="mt-3 font-display text-4xl font-semibold text-ink md:text-5xl">
        Clause by clause, cited.
      </Reveal>
      <Reveal as="p" delay={0.14} className="mt-4 max-w-2xl text-ink-soft">
        Load a sample or paste your own. Each clause is classified, checked
        against the playbook, and — where it deviates — redlined with a
        suggestion and the exact standard it&rsquo;s measured against.
      </Reveal>
      <Reveal variant="scale-in" delay={0.2} className="mt-10">
        <ReviewForm />
      </Reveal>
    </main>
  );
}
