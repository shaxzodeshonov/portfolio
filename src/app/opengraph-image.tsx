import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

import { heroLines, identity, stack } from "@/content/site";

/**
 * The card that X, Telegram, LinkedIn, Slack, WhatsApp and iMessage show when
 * someone pastes a link to this site.
 *
 * Generated at build time rather than hand-designed in Figma, so it can never
 * drift from the content in src/content/site.ts.
 *
 * Rendered by Satori, which supports a deliberate subset of CSS: flexbox only
 * (no grid), no shorthand `background`, and every element containing more than
 * one child needs an explicit display. Hence the slightly verbose markup.
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
  const [sans, sansBold, mono] = await Promise.all([
    readFile(join(FONT_DIR, "geist-sans", "Geist-Regular.ttf")),
    readFile(join(FONT_DIR, "geist-sans", "Geist-SemiBold.ttf")),
    readFile(join(FONT_DIR, "geist-mono", "GeistMono-Medium.ttf")),
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
            <div
              style={{
                fontFamily: "Geist Mono",
                fontSize: 22,
                letterSpacing: 4,
                color: BONE,
              }}
            >
              {identity.name.toUpperCase()}
            </div>
          </div>

          <div
            style={{
              fontFamily: "Geist Mono",
              fontSize: 20,
              letterSpacing: 3,
              color: MUTED,
            }}
          >
            {identity.location.toUpperCase()}
          </div>
        </div>

        {/* --- headline ------------------------------------------------ */}
        <div
          style={{ display: "flex", flexDirection: "column", position: "relative" }}
        >
          {/* One flex row per hero line. Letting Satori wrap a single string
              gives a ragged third line that overflows the card. */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 86,
              fontWeight: 600,
              letterSpacing: -3,
              lineHeight: 1.04,
              color: BONE,
            }}
          >
            {heroLines.map((line) => (
              <div key={line} style={{ display: "flex", whiteSpace: "nowrap" }}>
                {line}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 34,
            }}
          >
            <div style={{ width: 56, height: 3, backgroundColor: SIGNAL }} />
            <div
              style={{
                fontFamily: "Geist Mono",
                fontSize: 26,
                letterSpacing: 2,
                color: BONE,
                marginLeft: 20,
              }}
            >
              {identity.role}
            </div>
          </div>
        </div>

        {/* --- bottom row ---------------------------------------------- */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <div style={{ width: "100%", height: 1, backgroundColor: LINE }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 26,
            }}
          >
            <div
              style={{
                fontFamily: "Geist Mono",
                fontSize: 20,
                letterSpacing: 1,
                color: MUTED,
                whiteSpace: "nowrap",
              }}
            >
              {stack.slice(0, 5).join("  ·  ")}
            </div>
            <div
              style={{
                fontFamily: "Geist Mono",
                fontSize: 21,
                letterSpacing: 2,
                color: DIM,
              }}
            >
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
        { name: "Geist", data: sansBold, weight: 600, style: "normal" },
        { name: "Geist Mono", data: mono, weight: 500, style: "normal" },
      ],
    }
  );
}
