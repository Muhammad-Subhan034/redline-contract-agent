import { NextResponse } from "next/server";
import { listAuditEvents } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const events = await listAuditEvents();
  return NextResponse.json({ events });
}
