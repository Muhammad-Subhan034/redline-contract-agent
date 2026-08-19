import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { parseClauses } from "@/lib/clause-parse";
import { classifyClauseType } from "@/lib/classifier";
import { assessRisk } from "@/lib/risk";
import { hfChat } from "@/lib/hf";
import { insertReview, insertAuditEvent, type ClauseResult } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 45;

async function draftRedline(clauseText: string, standard: string, notes: string[]): Promise<string | null> {
  return hfChat([
    {
      role: "system",
      content:
        "You are a contracts reviewer. Given a clause, the firm's standard version, and the specific issues found, write ONE short suggested redline (a rewritten sentence or two) that fixes the issues while staying close to the original clause's structure. Output only the redlined text, no preamble, no markdown.",
    },
    {
      role: "user",
      content: `Original clause: ${clauseText}\n\nFirm standard: ${standard}\n\nIssues found: ${notes.join("; ")}`,
    },
  ], { maxTokens: 160 });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const title = (body?.title as string) || "Untitled contract";
  const text = body?.text as string | undefined;
  if (!text || !text.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const clauses = parseClauses(text);
  if (clauses.length === 0) {
    return NextResponse.json({ error: "Could not find any clauses in that text" }, { status: 422 });
  }

  const analyzed = clauses.map((clause) => {
    const classification = classifyClauseType(clause.text);
    const risk = assessRisk(classification.type, clause.text);
    return { clause, classification, risk };
  });

  const withRedlines = await Promise.all(
    analyzed.map(async ({ clause, classification, risk }): Promise<ClauseResult> => {
      const redline =
        risk.level !== "low"
          ? await draftRedline(clause.text, risk.playbookStandard, risk.notes)
          : null;
      return {
        index: clause.index,
        heading: clause.heading,
        text: clause.text,
        type: classification.type,
        confidence: classification.confidence,
        riskLevel: risk.level,
        riskNotes: risk.notes,
        playbookStandard: risk.playbookStandard,
        redline,
      };
    })
  );

  const highRiskCount = withRedlines.filter((r) => r.riskLevel === "high").length;
  const mediumRiskCount = withRedlines.filter((r) => r.riskLevel === "medium").length;
  const now = new Date().toISOString();

  const review = {
    id: randomUUID(),
    title,
    clauseCount: withRedlines.length,
    highRiskCount,
    mediumRiskCount,
    results: withRedlines,
    createdAt: now,
  };

  await insertReview(review);
  await insertAuditEvent({
    id: randomUUID(),
    actor: "system",
    action: "reviewed",
    detail: `Reviewed "${title}" — ${withRedlines.length} clauses, ${highRiskCount} high risk, ${mediumRiskCount} medium risk`,
    timestamp: now,
  });

  return NextResponse.json({ review });
}
