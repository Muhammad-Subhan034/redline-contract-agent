export default function Footer() {
  return (
    <footer className="mt-auto border-t border-ink/12 bg-ink text-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <p className="font-display text-lg font-semibold">Redline</p>
        <p className="max-w-md text-sm text-paper/70">
          A demo-grade contract review agent built to show the real pattern:
          classify, compare to a real playbook, and always cite the source —
          never an opinion with no paper trail.
        </p>
        <a
          href="https://github.com/Muhammad-Subhan034/redline-contract-agent"
          className="font-mono text-[12px] uppercase tracking-wide text-paper/80 underline decoration-paper/30 underline-offset-4 hover:text-paper"
        >
          Source on GitHub
        </a>
      </div>
    </footer>
  );
}
