import ReviewForm from "@/components/ReviewForm";

export default function ReviewPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="font-mono text-[11px] uppercase tracking-widest text-delete">Review</p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-ink md:text-5xl">
        Clause by clause, cited.
      </h1>
      <p className="mt-4 max-w-2xl text-ink-soft">
        Load a sample or paste your own. Each clause is classified, checked
        against the playbook, and — where it deviates — redlined with a
        suggestion and the exact standard it&rsquo;s measured against.
      </p>
      <div className="mt-10">
        <ReviewForm />
      </div>
    </main>
  );
}
