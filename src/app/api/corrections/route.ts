import { NextResponse } from "next/server";
import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

type CorrectionBody = {
  restaurantSlug?: string;
  restaurantName?: string;
  field?: string;
  currentValue?: string;
  suggestedValue?: string;
  details?: string;
  contactEmail?: string;
  website?: string;
};

const MAX_BODY_BYTES = 8_000;
const ALLOWED_FIELDS = new Set([
  "stars",
  "address",
  "website",
  "reservation",
  "coordinates",
  "closed_or_renamed",
  "other",
]);

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = checkRateLimit(`corrections:${ip}`, {
    windowMs: 60_000,
    max: 5,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please wait and try again." },
      { status: 429 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Request too large." },
      { status: 413 },
    );
  }

  let body: CorrectionBody;
  try {
    body = (await request.json()) as CorrectionBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  // Honeypot — bots that fill hidden fields are silently accepted without storage.
  if (body.website) {
    return NextResponse.json({ ok: true, id: "ignored" });
  }

  const restaurantName = (body.restaurantName || "").trim();
  const suggestedValue = (body.suggestedValue || "").trim();
  const details = (body.details || "").trim();
  const field = (body.field || "").trim();

  if (!restaurantName || !suggestedValue || !details || !ALLOWED_FIELDS.has(field)) {
    return NextResponse.json(
      { ok: false, error: "Missing or invalid fields." },
      { status: 400 },
    );
  }

  const id = `corr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const record = {
    id,
    receivedAt: new Date().toISOString(),
    restaurantSlug: (body.restaurantSlug || "").trim().slice(0, 200) || null,
    restaurantName: restaurantName.slice(0, 200),
    field,
    currentValue: (body.currentValue || "").trim().slice(0, 500) || null,
    suggestedValue: suggestedValue.slice(0, 500),
    details: details.slice(0, 2000),
    contactEmail: (body.contactEmail || "").trim().slice(0, 200) || null,
    ipHash: Buffer.from(ip).toString("base64url").slice(0, 16),
  };

  const dir = join(process.cwd(), "data", "correction-requests");
  await mkdir(dir, { recursive: true });
  await appendFile(
    join(dir, "requests.jsonl"),
    `${JSON.stringify(record)}\n`,
    "utf8",
  );

  return NextResponse.json({ ok: true, id });
}
