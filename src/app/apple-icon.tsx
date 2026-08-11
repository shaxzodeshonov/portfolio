import { ImageResponse } from "next/og";

/**
 * The 180×180 PNG iOS uses when someone adds the site to their home screen.
 * Same mark as icon.svg — Safari has never supported SVG icons here, so this
 * has to exist separately or the home-screen tile falls back to a screenshot.
 */

export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#08090b",
          position: "relative",
        }}
      >
        <svg width="180" height="180" viewBox="0 0 64 64">
          <path
            d="M43 21.5c-1.2-4.6-5.7-7.5-11.3-7.5-6.4 0-10.9 3.2-10.9 8 0 4.4 3.3 6.7 10.9 8.6 8.2 2 11.6 4.6 11.6 9.4 0 5.2-4.9 8.5-11.6 8.5-6 0-10.6-2.9-11.7-7.6"
            fill="none"
            stroke="#edeae4"
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="49.5" cy="49.5" r="6" fill="#4ade80" />
        </svg>
      </div>
    ),
    size
  );
}
