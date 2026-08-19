import { neon } from "@neondatabase/serverless";

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

let schemaReady: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  if (!sql) return Promise.resolve();
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS reviews (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          clause_count INTEGER NOT NULL,
          high_risk_count INTEGER NOT NULL,
          medium_risk_count INTEGER NOT NULL,
          results JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS audit_events (
          id TEXT PRIMARY KEY,
          actor TEXT NOT NULL,
          action TEXT NOT NULL,
          detail TEXT NOT NULL,
          timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
    })();
  }
  return schemaReady;
}

export type ClauseResult = {
  index: number;
  heading: string;
  text: string;
  type: string;
  confidence: number;
  riskLevel: "high" | "medium" | "low";
  riskNotes: string[];
  playbookStandard: string;
  redline: string | null;
};

export type ReviewRecord = {
  id: string;
  title: string;
  clauseCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  results: ClauseResult[];
  createdAt: string;
};

export type AuditEvent = {
  id: string;
  actor: "system" | "human";
  action: string;
  detail: string;
  timestamp: string;
};

const memReviews: ReviewRecord[] = [];
const memAudit: AuditEvent[] = [];

export async function insertReview(r: ReviewRecord): Promise<void> {
  await ensureSchema();
  if (!sql) return void memReviews.unshift(r);
  await sql`
    INSERT INTO reviews (id, title, clause_count, high_risk_count, medium_risk_count, results, created_at)
    VALUES (${r.id}, ${r.title}, ${r.clauseCount}, ${r.highRiskCount}, ${r.mediumRiskCount}, ${JSON.stringify(r.results)}, ${r.createdAt})
  `;
}

export async function listReviews(): Promise<ReviewRecord[]> {
  await ensureSchema();
  if (!sql) return memReviews;
  const rows = await sql`SELECT * FROM reviews ORDER BY created_at DESC LIMIT 50`;
  return rows.map((r) => ({
    id: r.id as string,
    title: r.title as string,
    clauseCount: r.clause_count as number,
    highRiskCount: r.high_risk_count as number,
    mediumRiskCount: r.medium_risk_count as number,
    results: r.results as ClauseResult[],
    createdAt: new Date(r.created_at as string).toISOString(),
  }));
}

export async function insertAuditEvent(e: AuditEvent): Promise<void> {
  await ensureSchema();
  if (!sql) return void memAudit.unshift(e);
  await sql`
    INSERT INTO audit_events (id, actor, action, detail, timestamp)
    VALUES (${e.id}, ${e.actor}, ${e.action}, ${e.detail}, ${e.timestamp})
  `;
}

export async function listAuditEvents(): Promise<AuditEvent[]> {
  await ensureSchema();
  if (!sql) return memAudit;
  const rows = await sql`SELECT * FROM audit_events ORDER BY timestamp DESC LIMIT 200`;
  return rows.map((r) => ({
    id: r.id as string,
    actor: r.actor as AuditEvent["actor"],
    action: r.action as string,
    detail: r.detail as string,
    timestamp: new Date(r.timestamp as string).toISOString(),
  }));
}

export const usingLiveDb = Boolean(sql);
