import { listAuditEvents, usingLiveDb } from "@/lib/db";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const events = await listAuditEvents();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <Reveal as="p" variant="clip-wipe" className="font-mono text-[11px] uppercase tracking-widest text-delete">
        Audit
      </Reveal>
      <Reveal as="h1" delay={0.08} className="mt-3 font-display text-4xl font-semibold text-ink md:text-5xl">
        Every review, on the record.
      </Reveal>
      <Reveal as="p" delay={0.14} className="mt-4 max-w-2xl text-ink-soft">
        {usingLiveDb
          ? "Reading from the live Postgres review log."
          : "No DATABASE_URL configured — reading from this server's in-memory log, which resets on redeploy."}{" "}
        Run a review from{" "}
        <a href="/review" className="underline">
          /review
        </a>{" "}
        to see entries appear here.
      </Reveal>

      <Reveal variant="scale-in" delay={0.2} className="mt-10 overflow-hidden rounded-sm border border-ink/12 bg-white">
        {events.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-ink-soft">No reviews logged yet.</p>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-paper-dim/70 font-mono text-[11px] uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-5 py-3">Actor</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Detail</th>
                <th className="px-5 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-t border-ink/8">
                  <td className="px-5 py-3 text-ink-soft">{e.actor}</td>
                  <td className="px-5 py-3 font-medium text-ink">{e.action}</td>
                  <td className="px-5 py-3 text-ink-soft">{e.detail}</td>
                  <td className="px-5 py-3 text-ink-soft">
                    {new Date(e.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Reveal>
    </main>
  );
}
