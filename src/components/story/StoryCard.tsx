import { forwardRef } from "react";

export type StoryType = "verse" | "verse-reveal" | "study";

export interface StoryData {
  type: StoryType;
  reference: string;
  verseText?: string;
  insightText?: string;
  studyTitle?: string;
  studyExcerpt?: string;
}

interface StoryCardProps {
  data: StoryData;
}

/**
 * Renders a 360×640 story card using ONLY inline styles
 * for reliable html2canvas capture on mobile.
 */
const StoryCard = forwardRef<HTMLDivElement, StoryCardProps>(({ data }, ref) => {
  const isStudy = data.type === "study";
  const hasReveal = data.type === "verse-reveal" || isStudy;

  return (
    <div
      ref={ref}
      style={{
        width: 360,
        height: 640,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Crimson Pro', Georgia, serif",
        backgroundColor: "#1A1C1E",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "linear-gradient(to right, #542A22, #8B5E3C, #542A22)",
        }}
      />

      {/* Corner ornaments */}
      <svg style={{ position: "absolute", top: 24, left: 24, width: 32, height: 32 }} viewBox="0 0 32 32" fill="none">
        <path d="M0 0 L32 0 L32 4 L4 4 L4 32 L0 32 Z" fill="rgba(84,42,34,0.4)" />
      </svg>
      <svg style={{ position: "absolute", top: 24, right: 24, width: 32, height: 32 }} viewBox="0 0 32 32" fill="none">
        <path d="M0 0 L32 0 L32 32 L28 32 L28 4 L0 4 Z" fill="rgba(84,42,34,0.4)" />
      </svg>
      <svg style={{ position: "absolute", bottom: 24, left: 24, width: 32, height: 32 }} viewBox="0 0 32 32" fill="none">
        <path d="M0 0 L4 0 L4 28 L32 28 L32 32 L0 32 Z" fill="rgba(84,42,34,0.4)" />
      </svg>
      <svg style={{ position: "absolute", bottom: 24, right: 24, width: 32, height: 32 }} viewBox="0 0 32 32" fill="none">
        <path d="M28 0 L32 0 L32 32 L0 32 L0 28 L28 28 Z" fill="rgba(84,42,34,0.4)" />
      </svg>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          flex: 1,
          paddingLeft: 40,
          paddingRight: 40,
          paddingTop: 64,
          paddingBottom: 64,
          justifyContent: "center",
        }}
      >
        {/* Decorative star */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ color: "rgba(139,94,60,0.6)", fontSize: 24, lineHeight: 1 }}>✦</span>
        </div>

        {/* Reference */}
        <p
          style={{
            textAlign: "center",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            fontSize: 12,
            marginBottom: 24,
            color: "#C4956A",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
          }}
        >
          {data.reference}
        </p>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 32 }}>
          <div style={{ height: 1, width: 40, backgroundColor: "rgba(84,42,34,0.4)" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "rgba(84,42,34,0.5)" }} />
          <div style={{ height: 1, width: 40, backgroundColor: "rgba(84,42,34,0.4)" }} />
        </div>

        {/* Main text */}
        {isStudy ? (
          <div>
            <h2
              style={{
                textAlign: "center",
                fontSize: 18,
                fontWeight: 600,
                lineHeight: 1.4,
                color: "#F5F0E8",
                marginBottom: data.studyExcerpt ? 20 : 0,
              }}
            >
              {data.studyTitle}
            </h2>
            {data.studyExcerpt && (
              <p
                style={{
                  textAlign: "center",
                  fontSize: 14,
                  lineHeight: 1.6,
                  fontStyle: "italic",
                  color: "#D4C9B8",
                }}
              >
                "{data.studyExcerpt}"
              </p>
            )}
          </div>
        ) : (
          <p
            style={{
              textAlign: "center",
              fontSize: 16,
              lineHeight: 1.6,
              fontStyle: "italic",
              color: "#F5F0E8",
            }}
          >
            "{data.verseText}"
          </p>
        )}

        {/* Reveal insight */}
        {hasReveal && data.insightText && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 32, marginBottom: 32 }}>
              <div style={{ height: 1, width: 24, backgroundColor: "rgba(84,42,34,0.3)" }} />
              <span style={{ color: "rgba(139,94,60,0.5)", fontSize: 12 }}>✦</span>
              <div style={{ height: 1, width: 24, backgroundColor: "rgba(84,42,34,0.3)" }} />
            </div>
            <p
              style={{
                textAlign: "center",
                fontSize: 12,
                lineHeight: 1.6,
                color: "#B8A898",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {data.insightText}
            </p>
          </div>
        )}
      </div>

      {/* Footer branding */}
      <div style={{ position: "relative", zIndex: 10, paddingBottom: 40, paddingTop: 16, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ height: 1, width: 24, backgroundColor: "rgba(84,42,34,0.3)" }} />
          <p
            style={{
              fontSize: 10,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#8B5E3C",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
            }}
          >
            via Revela
          </p>
          <div style={{ height: 1, width: 24, backgroundColor: "rgba(84,42,34,0.3)" }} />
        </div>
        <p
          style={{
            fontSize: 8,
            letterSpacing: "0.15em",
            color: "#5C5046",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          rrevela.lovable.app
        </p>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "linear-gradient(to right, #542A22, #8B5E3C, #542A22)",
        }}
      />
    </div>
  );
});

StoryCard.displayName = "StoryCard";

export default StoryCard;
