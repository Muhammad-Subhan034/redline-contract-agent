"use client";

import { useState } from "react";
import { SAMPLE_CONTRACTS } from "@/lib/sample-contracts";
import type { ClauseResult } from "@/lib/db";

const RISK_TONE: Record<string, string> = {
  high: "border-risk-high/40 bg-delete-soft text-risk-high",
  medium: "border-risk-medium/40 bg-risk-medium-soft text-risk-medium",
  low: "border-risk-low/40 bg-risk-low-soft text-risk-low",
};

export default function ReviewForm() {
  const [title, setTitle] = useState(SAMPLE_CONTRACTS[0].title);
  const [text, setText] = useState(SAMPLE_CONTRACTS[0].text);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<ClauseResult[] | null>(null);

  function loadSample(id: string) {
    const sample = SAMPLE_CONTRACTS.find((s) => s.id === id);
    if (sample) {
      setTitle(sample.title);
      setText(sample.text);
      setResults(null);
    }
  }

  async function runReview() {
    setBusy(true);
    setResults(null);
    const res = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, text }),
    });
    const data = await res.json();
    setResults(data.review?.results ?? null);
    setBusy(false);
  }

  return (
    <div>
      <div className="rounded-sm border border-ink/15 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="block flex-1">
            <span className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-sm border border-ink/20 bg-paper/50 px-3 py-2 text-sm outline-none focus:border-insert"
            />
          </label>
          <div className="flex gap-2">
            {SAMPLE_CONTRACTS.map((s) => (
              <button
                key={s.id}
                onClick={() => loadSample(s.id)}
                className="rounded-sm border border-dashed border-ink/25 px-3 py-1.5 text-xs text-ink-soft hover:border-ink/50"
              >
                Load: {s.title.split(" (")[0]}
              </button>
            ))}
          </div>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          className="mt-4 w-full rounded-sm border border-ink/20 bg-paper/50 px-3 py-3 font-mono text-[13px] leading-relaxed outline-none focus:border-insert"
        />
        <button
          onClick={runReview}
          disabled={busy || !text.trim()}
          className="mt-4 rounded-sm bg-ink px-5 py-2.5 font-mono text-[13px] uppercase tracking-wide text-paper disabled:opacity-40"
        >
          {busy ? "Reviewing…" : "Review contract"}
        </button>
      </div>

      {results && (
        <div className="mt-8 space-y-4">
          {results.map((r) => (
            <div key={r.index} className={`rounded-sm border p-5 ${RISK_TONE[r.riskLevel]} bg-white`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-display text-lg font-semibold text-ink">
                  {r.index}. {r.heading}
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wide text-ink-soft">
                    {r.type.replace(/_/g, " ")} · {Math.round(r.confidence * 100)}% confidence
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${RISK_TONE[r.riskLevel]}`}
                  >
                    {r.riskLevel} risk
                  </span>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{r.text}</p>
              <ul className="mt-3 space-y-1">
                {r.riskNotes.map((note, i) => (
                  <li key={i} className="text-xs text-ink-soft">
                    · {note}
                  </li>
                ))}
              </ul>
              {r.redline && (
                <div className="mt-3 rounded-sm border border-insert/25 bg-insert-soft/50 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-wide text-insert">
                    Suggested redline
                  </p>
                  <p className="mt-1 text-sm text-ink">{r.redline}</p>
                </div>
              )}
              <p className="mt-3 text-xs text-ink-soft/70">
                Playbook standard: {r.playbookStandard}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
