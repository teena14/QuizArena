import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "QuizArena — Quiz. Compete. Win.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default OG image served from /opengraph-image.
 * Individual routes can override by co-locating their own opengraph-image.tsx.
 * Dimensions: 1200×630 — satisfies Facebook, LinkedIn, and Twitter card specs.
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#111111",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
          position: "relative",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            left: "-80px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,127,18,0.25) 0%, transparent 70%)",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            width: "88px",
            height: "88px",
            borderRadius: "22px",
            background: "#FF7F12",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "36px",
          }}
        >
          <span
            style={{ color: "white", fontSize: "46px", fontWeight: 900, lineHeight: 1 }}
          >
            Q
          </span>
        </div>

        {/* Brand name */}
        <div
          style={{
            fontSize: "32px",
            fontWeight: 700,
            color: "#A5A5A5",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "20px",
          }}
        >
          QuizArena
        </div>

        {/* Main headline */}
        <div
          style={{
            fontSize: "80px",
            fontWeight: 900,
            color: "white",
            letterSpacing: "-3px",
            textAlign: "center",
            lineHeight: 1.05,
            marginBottom: "28px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          <span>Quiz.</span>
          <span>Compete.</span>
          <span style={{ color: "#FF7F12" }}>Win.</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "26px",
            color: "#A5A5A5",
            textAlign: "center",
            maxWidth: "750px",
            lineHeight: 1.5,
          }}
        >
          The competitive quiz platform for teachers and students
        </div>

        {/* Domain stamp */}
        <div
          style={{
            position: "absolute",
            bottom: "44px",
            right: "64px",
            fontSize: "18px",
            color: "#555555",
            letterSpacing: "0.02em",
          }}
        >
          quizarena-gpr1.onrender.com
        </div>
      </div>
    ),
    { ...size }
  );
}
