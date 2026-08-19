export type ParsedClause = {
  index: number;
  heading: string;
  text: string;
};

/** Splits raw contract text into clauses on blank-line boundaries — the same
 *  unit a reviewer actually reads one at a time. Falls back to sentence
 *  grouping if the text has no blank lines at all. */
export function parseClauses(raw: string): ParsedClause[] {
  const blocks = raw
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const source = blocks.length > 1 ? blocks : raw.split(/(?<=\.)\s+(?=[A-Z])/).filter(Boolean);

  return source.map((block, i) => {
    const headingMatch = block.match(/^\s*\d+(?:\.\d+)?\.?\s*([A-Z][\w\s/]{2,40}?)\.\s/);
    const heading = headingMatch ? headingMatch[1].trim() : `Clause ${i + 1}`;
    return { index: i + 1, heading, text: block.replace(/\s+/g, " ").trim() };
  });
}
