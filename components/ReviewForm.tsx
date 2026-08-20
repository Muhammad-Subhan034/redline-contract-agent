"use client";

import { useRef, useState } from "react";
import { SAMPLE_CONTRACTS } from "@/lib/sample-contracts";
import type { ClauseResult } from "@/lib/db";

const RISK_TONE: Record<string, string> = {
  high: "border-risk-high/40 bg-delete-soft text-risk-high",
  medium: "border-risk-medium/40 bg-risk-medium-soft text-risk-medium",
  low: "border-risk-low/40 bg-risk-low-soft text-risk-low",
};

const EXTRACTION_LABEL: Record<string, string> = {
  pdf: "extracted from PDF",
  docx: "extracted from Word doc",
  text: "plain text",
  "vision-ocr": "transcribed from image by a vision model",
};

type Mode = "paste" | "upload";

export default function ReviewForm() {
  const [mode, setMode] = useState<Mode>("upload");
  const [title, setTitle] = useState(SAMPLE_CONTRACTS[0].title);
  const [text, setText] = useState(SAMPLE_CONTRACTS[0].text);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractionMethod, setExtractionMethod] = useState<string | null>(null);
  const [results, setResults] = useState<ClauseResult[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function loadSample(id: string) {
    const sample = SAMPLE_CONTRACTS.find((s) => s.id === id);
    if (sample) {
      setMode("paste");
      setTitle(sample.title);
      setText(sample.text);
      setFile(null);
      setResults(null);
      setError(null);
    }
  }

  function handleFileChange(f: File | null) {
    setFile(f);
    setResults(null);
    setError(null);
    if (f && (title === SAMPLE_CONTRACTS[0].title || !title)) {
      setTitle(f.name.replace(/\.[^.]+$/, ""));
    }
  }

  async function runReview() {
    setBusy(true);
    setResults(null);
    setError(null);
    setExtractionMethod(null);

    try {
      let res: Response;
      if (mode === "upload" && file) {
        const form = new FormData();
        form.append("file", file);
        form.append("title", title);
        res = await fetch("/api/review", { method: "POST", body: form });
      } else {
        res = await fetch("/api/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, text }),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Review failed");
      setResults(data.review?.results ?? null);
      setExtractionMethod(data.extractionMethod ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const canSubmit = mode === "upload" ? Boolean(file) : Boolean(text.trim());

  return (
    <div>
      <div className="rounded-sm border border-ink/15 bg-white p-6">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-sm border border-ink/20 bg-paper/50 px-3 py-2 text-sm outline-none focus:border-insert"
          />
        </label>

        <div className="mt-4 flex gap-2 border-b border-ink/10 pb-4">
          <button
            onClick={() => setMode("upload")}
            className={`rounded-sm px-3 py-1.5 font-mono text-[12px] uppercase tracking-wide ${
              mode === "upload" ? "bg-ink text-paper" : "border border-ink/20 text-ink-soft"
            }`}
          >
            Upload file
          </button>
          <button
            onClick={() => setMode("paste")}
            className={`rounded-sm px-3 py-1.5 font-mono text-[12px] uppercase tracking-wide ${
              mode === "paste" ? "bg-ink text-paper" : "border border-ink/20 text-ink-soft"
            }`}
          >
            Paste text
          </button>
        </div>

        {mode === "upload" ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) handleFileChange(f);
            }}
            onClick={() => fileInputRef.current?.click()}
            data-cursor-hover
            className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed border-ink/25 px-6 py-10 text-center transition-colors duration-300 hover:border-insert"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <>
                <p className="font-medium text-ink">{file.name}</p>
                <p className="mt-1 text-xs text-ink-soft">
                  {(file.size / 1024).toFixed(0)} KB — click to choose a different file
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-ink">Drop a contract here, or click to browse</p>
                <p className="mt-1 text-xs text-ink-soft">PDF, DOCX, TXT, or a photo/scan (PNG, JPG)</p>
              </>
            )}
          </div>
        ) : (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            className="mt-4 w-full rounded-sm border border-ink/20 bg-paper/50 px-3 py-3 font-mono text-[13px] leading-relaxed outline-none focus:border-insert"
          />
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={runReview}
            disabled={busy || !canSubmit}
            className="group relative overflow-hidden rounded-sm bg-ink px-5 py-2.5 font-mono text-[13px] uppercase tracking-wide text-paper disabled:opacity-40"
          >
            {!busy && <span className="tilt-sheen" aria-hidden="true" />}
            <span className="relative">{busy ? "Reviewing…" : "Review contract"}</span>
          </button>
          <div className="flex gap-2">
            {SAMPLE_CONTRACTS.map((s) => (
              <button
                key={s.id}
                onClick={() => loadSample(s.id)}
                className="rounded-sm border border-dashed border-ink/25 px-3 py-1.5 text-xs text-ink-soft hover:border-ink/50"
              >
                Or load sample: {s.title.split(" (")[0]}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-risk-high">{error}</p>}
      </div>

      {results && (
        <div className="mt-8 space-y-4">
          {extractionMethod && (
            <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
              {EXTRACTION_LABEL[extractionMethod] ?? extractionMethod}
            </p>
          )}
          {results.map((r, i) => (
            <div
              key={r.index}
              style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }}
              className={`result-card rounded-sm border p-5 ${RISK_TONE[r.riskLevel]} bg-white`}
            >
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
