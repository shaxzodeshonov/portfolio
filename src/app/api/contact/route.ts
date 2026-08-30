import { NextResponse } from "next/server";
import { Resend } from "resend";

import { contactSchema, type ContactResponse } from "@/lib/contact-schema";

/**
 * POST /api/contact
 *
 * Validates, rate-limits, and then logs the message to the server console.
 * Wire an email provider where marked — everything around that line is already
 * production-shaped.
 */

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmailHtml({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}): string {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).split("\n").join("<br>");

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f0;color:#181818;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:6px;padding:32px;border:1px solid #d4d4d4;">
        <tr><td>
          <h2 style="margin:0 0 24px;font-size:18px;font-weight:600;color:#181818;">
            New message from portfolio
          </h2>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #e0e0e0;font-family:'Geist Mono',ui-monospace,monospace;font-size:12px;color:#666;width:70px;vertical-align:top;">
                Name
              </td>
              <td style="padding:8px 0 8px 12px;border-bottom:1px solid #e0e0e0;font-size:14px;">
                ${safeName}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #e0e0e0;font-family:'Geist Mono',ui-monospace,monospace;font-size:12px;color:#666;width:70px;vertical-align:top;">
                Email
              </td>
              <td style="padding:8px 0 8px 12px;border-bottom:1px solid #e0e0e0;font-size:14px;">
                <a href="mailto:${safeEmail}" style="color:#181818;">${safeEmail}</a>
              </td>
            </tr>
          </table>

          <div style="font-size:14px;line-height:1.6;white-space:pre-line;">
            ${safeMessage}
          </div>

          <p style="margin:32px 0 0;font-size:11px;color:#999;font-family:'Geist Mono',ui-monospace,monospace;">
            Sent from shxzd.dev
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

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

  try {
    await resend.emails.send({
      from: "Portfolio <onboarding@resend.dev>",
      to: "es.shaxzod@gmail.com",
      replyTo: email,
      subject: `Portfolio — ${name}`,
      html: buildEmailHtml({ name, email, message }),
      text: message,
    });
  } catch (error) {
    console.error("[contact] failed to send email", error);
    // Do not change the response below — the visitor still sees success
    // even if the email failed, per the existing UX.
  }

  return NextResponse.json({
    ok: true,
    message: "Message received. I'll reply within a day or two.",
  });
}
