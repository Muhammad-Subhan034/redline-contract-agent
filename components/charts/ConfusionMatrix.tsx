"use client";

import { useState } from "react";

const SEQUENTIAL = [
  "#dfe6fb", "#c6d2f8", "#adbef4", "#94aaf1", "#7b96ed",
  "#6282ea", "#4a6ee6", "#2f5fed", "#2a52d4", "#2445bb", "#1f38a1",
];

function colorFor(value: number, max: number) {
  if (max === 0) return SEQUENTIAL[0];
  const t = Math.min(1, value / max);
  const idx = Math.round(t * (SEQUENTIAL.length - 1));
  return SEQUENTIAL[idx];
}

function short(label: string) {
  return label
    .split("_")
    .map((w) => w.slice(0, 4))
    .join(" ");
}

export default function ConfusionMatrix({
  classes,
  matrix,
}: {
  classes: string[];
  matrix: number[][];
}) {
  const [hover, setHover] = useState<[number, number] | null>(null);
  const max = Math.max(...matrix.flat());

  return (
    <div className="overflow-x-auto">
      <table className="border-separate" style={{ borderSpacing: 3 }}>
        <thead>
          <tr>
            <th className="text-left"></th>
            <th
              colSpan={classes.length}
              className="pb-1 text-center font-mono text-[10px] uppercase tracking-wide text-ink-soft"
            >
              Predicted
            </th>
          </tr>
          <tr>
            <th className="pr-2 text-left font-mono text-[9px] uppercase tracking-wide text-ink-soft">
              Actual
            </th>
            {classes.map((c) => (
              <th key={c} className="px-0.5 pb-1 text-center font-mono text-[9px] text-ink-soft">
                {short(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={classes[i]}>
              <th className="pr-2 text-right font-mono text-[9px] font-normal text-ink-soft">
                {short(classes[i])}
              </th>
              {row.map((value, j) => {
                const isHover = hover?.[0] === i && hover?.[1] === j;
                const bg = colorFor(value, max);
                const isDiagonal = i === j;
                return (
                  <td key={j}>
                    <div
                      onMouseEnter={() => setHover([i, j])}
                      onMouseLeave={() => setHover(null)}
                      className={`relative flex h-9 w-9 items-center justify-center rounded-[3px] font-mono text-[11px] transition-transform ${
                        isDiagonal ? "ring-1 ring-ink/25" : ""
                      } ${isHover ? "scale-[1.08]" : ""}`}
                      style={{ background: bg, color: value / max > 0.55 ? "#fff" : "#1a1a18" }}
                      title={`Actual ${classes[i]}, predicted ${classes[j]}: ${value}`}
                    >
                      {value}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[11px] text-ink-soft">
        Diagonal (ringed) cells are correct predictions on the held-out test set.
      </p>
    </div>
  );
}
