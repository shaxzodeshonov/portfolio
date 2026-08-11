import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

import { heroLines, identity, stack } from "@/content/site";

/**
 * The card that X, Telegram, LinkedIn, Slack, WhatsApp and iMessage show when
 * someone pastes a link to this site.
 *
 * Generated at build time from src/content/site.ts, so it can never drift
 * from the page it advertises.
 *
 * Rendered by Satori, which supports a deliberate subset of CSS: flexbox only
 * (no grid), no shorthand `background`, and every element with more than one
 * child needs an explicit display. It also cannot parse variable fonts — the
 * Geist package ships static TTF cuts, which is why those are used here.
 */

export const runtime = "nodejs";
export const alt = `${identity.name} — ${identity.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FONT_DIR = join(process.cwd(), "node_modules", "geist", "dist", "fonts");

const VOID = "#08090b";
const BONE = "#edeae4";
const MUTED = "#7c838e";
const DIM = "#4d545e";
const SIGNAL = "#4ade80";
const LINE = "#1e232b";

export default async function OpengraphImage() {
  const [sans, sansMedium, mono] = await Promise.all([
    readFile(join(FONT_DIR, "geist-sans", "Geist-Regular.ttf")),
    readFile(join(FONT_DIR, "geist-sans", "Geist-Medium.ttf")),
    readFile(join(FONT_DIR, "geist-mono", "GeistMono-Regular.ttf")),
  ]);

  // The blueprint grid, drawn as positioned rules because Satori has no
  // repeating-background support.
  const columns = Array.from({ length: 11 }, (_, i) => (i + 1) * 100);
  const rows = Array.from({ length: 6 }, (_, i) => (i + 1) * 100);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: VOID,
          position: "relative",
          padding: "64px 72px",
          fontFamily: "Geist",
        }}
      >
        {columns.map((x) => (
          <div
            key={`c${x}`}
            style={{
              position: "absolute",
              left: x,
              top: 0,
              width: 1,
              height: 630,
              backgroundColor: "rgba(120,150,190,0.06)",
            }}
          />
        ))}
        {rows.map((y) => (
          <div
            key={`r${y}`}
            style={{
              position: "absolute",
              left: 0,
              top: y,
              width: 1200,
              height: 1,
              backgroundColor: "rgba(120,150,190,0.06)",
            }}
          />
        ))}

        {/* Horizon glow, echoing the lattice in the real hero. Pushed right
            and dimmed so it never sits directly behind the type. */}
        <div
          style={{
            position: "absolute",
            left: 420,
            bottom: -340,
            width: 1100,
            height: 560,
            backgroundImage: `radial-gradient(closest-side, rgba(61,126,255,0.34), rgba(74,222,128,0.08) 58%, rgba(8,9,11,0) 100%)`,
          }}
        />

        {/* --- top row ------------------------------------------------- */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: SIGNAL,
                marginRight: 14,
              }}
            />
            <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: -0.5, color: BONE }}>
              {identity.name}
            </div>
          </div>

          <div style={{ fontSize: 21, color: MUTED }}>{identity.location}</div>
        </div>

        {/* --- headline ------------------------------------------------ */}
        <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
          {/* One flex row per hero line. Letting Satori wrap a single string
              gives a ragged third line that overflows the card. */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 94,
              fontWeight: 500,
              letterSpacing: -4,
              lineHeight: 0.98,
              color: BONE,
            }}
          >
            {heroLines.map((line) => (
              <div key={line} style={{ display: "flex", whiteSpace: "nowrap" }}>
                {line}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", marginTop: 34 }}>
            <div style={{ width: 54, height: 3, backgroundColor: SIGNAL }} />
            <div style={{ fontSize: 26, color: BONE, marginLeft: 20 }}>
              {identity.role}
            </div>
          </div>
        </div>

        {/* --- bottom row ---------------------------------------------- */}
        <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
          <div style={{ width: "100%", height: 1, backgroundColor: LINE }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 26,
            }}
          >
            <div style={{ fontSize: 20, color: MUTED, whiteSpace: "nowrap" }}>
              {stack.slice(0, 5).join("  ·  ")}
            </div>
            <div style={{ fontFamily: "Geist Mono", fontSize: 19, color: DIM }}>
              {identity.socials[0].handle}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: sans, weight: 400, style: "normal" },
        { name: "Geist", data: sansMedium, weight: 500, style: "normal" },
        { name: "Geist Mono", data: mono, weight: 400, style: "normal" },
      ],
    }
  );
}
