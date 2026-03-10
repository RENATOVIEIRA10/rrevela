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
 * 360×640 story card — pure inline styles, NO letter-spacing (html2canvas bug),
 * system fonts only for reliable mobile capture.
 */
const StoryCard = forwardRef<HTMLDivElement, StoryCardProps>(({ data }, ref) => {
  const isStudy = data.type === "study";
  const hasReveal = data.type === "verse-reveal" || isStudy;

  const sansFont = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const serifFont = "Georgia, 'Times New Roman', Times, serif";

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
        fontFamily: serifFont,
        backgroundColor: "#1A1C1E",
        boxSizing: "border-box",
      }}
    >
      {/* Top gradient bar */}
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

      {/* Corner ornaments — simple L shapes */}
      <div style={{ position: "absolute", top: 24, left: 24, width: 28, height: 28, borderTop: "2px solid rgba(84,42,34,0.4)", borderLeft: "2px solid rgba(84,42,34,0.4)" }} />
      <div style={{ position: "absolute", top: 24, right: 24, width: 28, height: 28, borderTop: "2px solid rgba(84,42,34,0.4)", borderRight: "2px solid rgba(84,42,34,0.4)" }} />
      <div style={{ position: "absolute", bottom: 24, left: 24, width: 28, height: 28, borderBottom: "2px solid rgba(84,42,34,0.4)", borderLeft: "2px solid rgba(84,42,34,0.4)" }} />
      <div style={{ position: "absolute", bottom: 24, right: 24, width: 28, height: 28, borderBottom: "2px solid rgba(84,42,34,0.4)", borderRight: "2px solid rgba(84,42,34,0.4)" }} />

      {/* Content area */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          flex: 1,
          paddingLeft: 44,
          paddingRight: 44,
          paddingTop: 72,
          paddingBottom: 72,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Decorative diamond */}
        <div style={{ textAlign: "center", marginBottom: 28, color: "rgba(139,94,60,0.6)", fontSize: 22, lineHeight: 1 }}>
          ✦
        </div>

        {/* Reference */}
        <div
          style={{
            textAlign: "center",
            textTransform: "uppercase",
            fontSize: 11,
            marginBottom: 20,
            color: "#C4956A",
            fontFamily: sansFont,
            fontWeight: 600,
          }}
        >
          {data.reference}
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
          <div style={{ height: 1, width: 36, backgroundColor: "rgba(84,42,34,0.4)" }} />
          <div style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: "rgba(84,42,34,0.5)", marginLeft: 10, marginRight: 10 }} />
          <div style={{ height: 1, width: 36, backgroundColor: "rgba(84,42,34,0.4)" }} />
        </div>

        {/* Main text */}
        {isStudy ? (
          <div style={{ width: "100%" }}>
            <div
              style={{
                textAlign: "center",
                fontSize: 17,
                fontWeight: 600,
                lineHeight: 1.5,
                color: "#F5F0E8",
                marginBottom: data.studyExcerpt ? 18 : 0,
                fontFamily: serifFont,
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {data.studyTitle}
            </div>
            {data.studyExcerpt && (
              <div
                style={{
                  textAlign: "center",
                  fontSize: 13,
                  lineHeight: 1.7,
                  fontStyle: "italic",
                  color: "#D4C9B8",
                  fontFamily: serifFont,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                "{data.studyExcerpt}"
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              fontSize: 15,
              lineHeight: 1.7,
              fontStyle: "italic",
              color: "#F5F0E8",
              fontFamily: serifFont,
              wordWrap: "break-word",
              overflowWrap: "break-word",
              width: "100%",
            }}
          >
            "{data.verseText}"
          </div>
        )}

        {/* Reveal insight */}
        {hasReveal && data.insightText && (
          <div style={{ width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 28, marginBottom: 28 }}>
              <div style={{ height: 1, width: 20, backgroundColor: "rgba(84,42,34,0.3)" }} />
              <div style={{ color: "rgba(139,94,60,0.5)", fontSize: 10, marginLeft: 8, marginRight: 8 }}>✦</div>
              <div style={{ height: 1, width: 20, backgroundColor: "rgba(84,42,34,0.3)" }} />
            </div>
            <div
              style={{
                textAlign: "center",
                fontSize: 11,
                lineHeight: 1.7,
                color: "#B8A898",
                fontFamily: sansFont,
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {data.insightText}
            </div>
          </div>
        )}
      </div>

      {/* Footer branding */}
      <div style={{ position: "relative", zIndex: 10, paddingBottom: 36, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
          <div style={{ height: 1, width: 20, backgroundColor: "rgba(84,42,34,0.3)" }} />
          <div
            style={{
              fontSize: 9,
              textTransform: "uppercase",
              color: "#8B5E3C",
              fontFamily: sansFont,
              fontWeight: 600,
              marginLeft: 8,
              marginRight: 8,
            }}
          >
            VIA REVELA
          </div>
          <div style={{ height: 1, width: 20, backgroundColor: "rgba(84,42,34,0.3)" }} />
        </div>
        <div
          style={{
            fontSize: 8,
            color: "#5C5046",
            fontFamily: sansFont,
          }}
        >
          rrevela.lovable.app
        </div>
      </div>

      {/* Bottom gradient bar */}
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
