import { NextResponse } from "next/server";

import { contactSchema, type ContactResponse } from "@/lib/contact-schema";

/**
 * POST /api/contact
 *
 * Validates, rate-limits, and then logs the message to the server console.
 * Wire an email provider where marked — everything around that line is already
 * production-shaped.
 */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 3;

// In-memory and therefore per-instance: fine for a personal site on a single
// container, useless behind an autoscaler. Move to Redis or Upstash if this
// ever runs on more than one box.
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);

  // Opportunistic cleanup so the map can't grow without bound.
  if (hits.size > 500) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }

  return recent.length > MAX_PER_WINDOW;
}

export async function POST(request: Request): Promise<NextResponse<ContactResponse>> {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, message: "Slow down a moment — try again in a minute." },
      { status: 429 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Malformed request body." },
      { status: 400 }
    );
  }

  const parsed = contactSchema.safeParse(payload);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      fieldErrors[field] ??= issue.message;
    }
    return NextResponse.json(
      { ok: false, message: "Some fields need another look.", fieldErrors },
      { status: 422 }
    );
  }

  // Honeypot tripped. Answer exactly as if it succeeded so a bot gets no
  // signal that it was caught.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true, message: "Thanks — message received." });
  }

  const { name, email, message } = parsed.data;

  // ---------------------------------------------------------------------
  // TODO: send the email. Resend is two lines here:
  //
  //   const resend = new Resend(process.env.RESEND_API_KEY);
  //   await resend.emails.send({ from, to, subject: `Portfolio — ${name}`, text: message });
  //
  // Until then it logs, which is enough to prove the round trip works.
  // ---------------------------------------------------------------------
  console.log("[contact] new message", {
    name,
    email,
    length: message.length,
    at: new Date().toISOString(),
  });

  return NextResponse.json({
    ok: true,
    message: "Message received. I'll reply within a day or two.",
  });
}
