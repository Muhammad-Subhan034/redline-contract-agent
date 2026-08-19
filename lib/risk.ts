import { getPlaybookEntry, type ClauseType } from "./playbook";

export type RiskAssessment = {
  level: "high" | "medium" | "low";
  notes: string[];
  playbookStandard: string;
};

export function assessRisk(type: ClauseType, clauseText: string): RiskAssessment {
  const entry = getPlaybookEntry(type);
  const hits = entry.redFlags.filter((flag) => flag.pattern.test(clauseText));

  const level = hits.some((h) => h.risk === "high")
    ? "high"
    : hits.some((h) => h.risk === "medium")
      ? "medium"
      : "low";

  const notes = hits.length > 0 ? hits.map((h) => h.note) : ["No known red-flag language detected against the playbook."];

  return { level, notes, playbookStandard: entry.standard };
}
