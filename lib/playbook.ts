export type ClauseType =
  | "indemnification"
  | "limitation_of_liability"
  | "termination"
  | "confidentiality"
  | "ip_assignment"
  | "payment_terms"
  | "governing_law"
  | "warranty_disclaimer";

export type PlaybookEntry = {
  type: ClauseType;
  label: string;
  standard: string;
  redFlags: { pattern: RegExp; risk: "high" | "medium" | "low"; note: string }[];
};

export const PLAYBOOK: PlaybookEntry[] = [
  {
    type: "indemnification",
    label: "Indemnification",
    standard:
      "Each party shall indemnify the other only for third-party claims arising from its own gross negligence or willful misconduct, with indemnifying party's liability capped at the fees paid under this agreement.",
    redFlags: [
      { pattern: /\b(unlimited|uncapped|without limit)\b/i, risk: "high", note: "Uncapped indemnity obligation" },
      { pattern: /\bsole (negligence|fault)\b/i, risk: "medium", note: "One-sided fault standard" },
      { pattern: /\bindemnify.*(any|all) claims\b/i, risk: "medium", note: "Overbroad claim scope, not limited to third-party claims" },
    ],
  },
  {
    type: "limitation_of_liability",
    label: "Limitation of Liability",
    standard:
      "In no event shall either party's liability exceed two times the total fees paid in the prior 12 months, excluding claims for breach of confidentiality or IP infringement.",
    redFlags: [
      { pattern: /\b(no|not).{0,20}\blimit(ed|ation)?\b/i, risk: "high", note: "Liability cap removed entirely" },
      { pattern: /\btotal fees paid\b(?!.{0,15}(two|three|multiple|\d))/i, risk: "medium", note: "Cap set at 1x fees, below the 2x floor" },
      { pattern: /\bconsequential damages\b/i, risk: "medium", note: "Consequential damages carve-out language present — verify direction" },
    ],
  },
  {
    type: "termination",
    label: "Termination",
    standard:
      "Either party may terminate for convenience with 60 days' written notice, or immediately for uncured material breach after a 30-day cure period.",
    redFlags: [
      { pattern: /\bsole discretion\b/i, risk: "high", note: "One-sided termination right at sole discretion" },
      { pattern: /\bimmediately\b.{0,30}\bwithout (notice|cause)\b/i, risk: "high", note: "Termination without notice or cause" },
      { pattern: /\b(90|120)\s*days\b/i, risk: "medium", note: "Notice period longer than the 60-day standard" },
    ],
  },
  {
    type: "confidentiality",
    label: "Confidentiality",
    standard:
      "Confidential information must be protected for 3 years post-termination using reasonable care, with standard carve-outs for public, independently developed, or legally compelled disclosure.",
    redFlags: [
      { pattern: /\bperpetual(ly)?\b/i, risk: "medium", note: "Perpetual confidentiality obligation, beyond the 3-year standard" },
      { pattern: /\bno (exceptions|carve-?outs)\b/i, risk: "high", note: "Missing standard disclosure carve-outs" },
      { pattern: /\breasonable care\b/i, risk: "low", note: "Matches standard care requirement" },
    ],
  },
  {
    type: "ip_assignment",
    label: "IP Assignment",
    standard:
      "Each party retains ownership of its pre-existing IP; work product created under this agreement is assigned to the paying party upon full payment.",
    redFlags: [
      { pattern: /\b(all|any) (background|pre-existing) (ip|intellectual property)\b/i, risk: "high", note: "Assigns pre-existing IP, not just work product" },
      { pattern: /\bperpetual, irrevocable, worldwide\b/i, risk: "medium", note: "Broad license grant beyond work product assignment" },
      { pattern: /\bupon (full )?payment\b/i, risk: "low", note: "Assignment properly conditioned on payment" },
    ],
  },
  {
    type: "payment_terms",
    label: "Payment Terms",
    standard:
      "Invoices are due net 30 days, with 1.5% monthly interest on late balances and a right to suspend services after 15 days past due.",
    redFlags: [
      { pattern: /\bnet\s*(60|90)\b/i, risk: "medium", note: "Payment terms slower than the net-30 standard" },
      { pattern: /\bno (interest|late fee)\b/i, risk: "low", note: "No late-payment remedy specified" },
      { pattern: /\bimmediately due\b/i, risk: "medium", note: "Acceleration clause on any breach" },
    ],
  },
  {
    type: "governing_law",
    label: "Governing Law",
    standard:
      "This agreement is governed by the laws of the state where the paying party is headquartered, with exclusive jurisdiction in that state's courts.",
    redFlags: [
      { pattern: /\bexclusive jurisdiction\b.{0,40}\b(?!headquarter)/i, risk: "low", note: "Confirm jurisdiction matches headquarters state" },
      { pattern: /\barbitration\b/i, risk: "medium", note: "Mandatory arbitration in place of court jurisdiction" },
      { pattern: /\bwaive.{0,20}jury trial\b/i, risk: "medium", note: "Jury trial waiver present" },
    ],
  },
  {
    type: "warranty_disclaimer",
    label: "Warranty Disclaimer",
    standard:
      "Services are warranted to be performed in a professional manner; all other warranties are disclaimed to the extent permitted by law, with a 90-day remedy period for defects.",
    redFlags: [
      { pattern: /\bas[ -]is\b/i, risk: "high", note: "Full 'as-is' disclaimer, no professional-services warranty" },
      { pattern: /\bno warrant(y|ies)\b.{0,20}\bwhatsoever\b/i, risk: "high", note: "Blanket warranty disclaimer with no carve-out" },
      { pattern: /\b(30|45)[ -]day\b/i, risk: "medium", note: "Remedy period shorter than the 90-day standard" },
    ],
  },
];

export function getPlaybookEntry(type: ClauseType): PlaybookEntry {
  return PLAYBOOK.find((p) => p.type === type) ?? PLAYBOOK[0];
}
