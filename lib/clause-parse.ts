export type ParsedClause = {
  index: number;
  heading: string;
  text: string;
};

const HEADING_RE = /\d+\.\s*[A-Z][\w\s/]{2,40}?\.\s/;
// Matches the start of each numbered clause ("1. Indemnification. ...") so we can
// split there directly — the reliable signal, since blank-line paragraph breaks
// routinely don't survive PDF/DOCX text extraction (lines get joined with a
// single \n regardless of the original paragraph structure).
const CLAUSE_BOUNDARY_RE = new RegExp(`(?=${HEADING_RE.source})`, "g");

function stripExtractionArtifacts(raw: string): string {
  return raw
    .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "") // pdf-parse page markers
    .replace(/\f/g, "\n") // form-feed page breaks
    .trim();
}

export function parseClauses(rawInput: string): ParsedClause[] {
  const raw = stripExtractionArtifacts(rawInput);

  // 1. Prefer splitting on numbered clause headings — works regardless of
  //    whether paragraph breaks survived extraction.
  const numberedSplits = raw.split(CLAUSE_BOUNDARY_RE).map((b) => b.trim()).filter(Boolean);
  if (numberedSplits.length > 1) {
    return numberedSplits.map((block, i) => {
      const headingMatch = block.match(/^\d+\.\s*([A-Z][\w\s/]{2,40}?)\.\s/);
      return {
        index: i + 1,
        heading: headingMatch ? headingMatch[1].trim() : `Clause ${i + 1}`,
        text: block.replace(/\s+/g, " ").trim(),
      };
    });
  }

  // 2. Fall back to blank-line paragraph breaks.
  const blocks = raw.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  if (blocks.length > 1) {
    return blocks.map((block, i) => {
      const headingMatch = block.match(/^\s*\d+(?:\.\d+)?\.?\s*([A-Z][\w\s/]{2,40}?)\.\s/);
      return {
        index: i + 1,
        heading: headingMatch ? headingMatch[1].trim() : `Clause ${i + 1}`,
        text: block.replace(/\s+/g, " ").trim(),
      };
    });
  }

  // 3. Last resort: group by sentence so a single unbroken paragraph still
  //    produces something reviewable instead of one giant block.
  const sentences = raw.split(/(?<=\.)\s+(?=[A-Z])/).filter(Boolean);
  return sentences.map((block, i) => ({
    index: i + 1,
    heading: `Clause ${i + 1}`,
    text: block.replace(/\s+/g, " ").trim(),
  }));
}
