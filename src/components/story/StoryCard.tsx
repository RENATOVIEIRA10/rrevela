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
 * Renders a 1080×1920 (9:16) story card.
 * Rendered at 360×640 CSS px and scaled 3× for export via html2canvas.
 */
const StoryCard = forwardRef<HTMLDivElement, StoryCardProps>(({ data }, ref) => {
  const isStudy = data.type === "study";
  const hasReveal = data.type === "verse-reveal" || isStudy;

  return (
    <div
      ref={ref}
      style={{ width: 360, height: 640, fontFamily: "'Crimson Pro', Georgia, serif" }}
      className="relative overflow-hidden flex flex-col"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[#1A1C1E]" />

      {/* Decorative top bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#542A22] via-[#8B5E3C] to-[#542A22]" />

      {/* Decorative corner ornaments */}
      <svg className="absolute top-6 left-6 w-8 h-8 text-[#542A22]/40" viewBox="0 0 32 32" fill="none">
        <path d="M0 0 L32 0 L32 4 L4 4 L4 32 L0 32 Z" fill="currentColor" />
      </svg>
      <svg className="absolute top-6 right-6 w-8 h-8 text-[#542A22]/40" viewBox="0 0 32 32" fill="none">
        <path d="M0 0 L32 0 L32 32 L28 32 L28 4 L0 4 Z" fill="currentColor" />
      </svg>
      <svg className="absolute bottom-6 left-6 w-8 h-8 text-[#542A22]/40" viewBox="0 0 32 32" fill="none">
        <path d="M0 0 L4 0 L4 28 L32 28 L32 32 L0 32 Z" fill="currentColor" />
      </svg>
      <svg className="absolute bottom-6 right-6 w-8 h-8 text-[#542A22]/40" viewBox="0 0 32 32" fill="none">
        <path d="M28 0 L32 0 L32 32 L0 32 L0 28 L28 28 Z" fill="currentColor" />
      </svg>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 px-10 py-16 justify-center">
        {/* Top: Small cross / decorative element */}
        <div className="text-center mb-8">
          <span className="text-[#8B5E3C]/60 text-2xl leading-none">✦</span>
        </div>

        {/* Reference */}
        <p
          className="text-center tracking-[0.25em] uppercase text-xs mb-6"
          style={{ color: "#C4956A", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
        >
          {data.reference}
        </p>

        {/* Divider */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-10 bg-[#542A22]/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#542A22]/50" />
          <div className="h-px w-10 bg-[#542A22]/40" />
        </div>

        {/* Main text */}
        {isStudy ? (
          <div className="space-y-5">
            <h2
              className="text-center text-lg font-semibold leading-snug"
              style={{ color: "#F5F0E8" }}
            >
              {data.studyTitle}
            </h2>
            {data.studyExcerpt && (
              <p
                className="text-center text-sm leading-relaxed italic"
                style={{ color: "#D4C9B8" }}
              >
                "{data.studyExcerpt}"
              </p>
            )}
          </div>
        ) : (
          <blockquote
            className="text-center text-base leading-relaxed italic"
            style={{ color: "#F5F0E8" }}
          >
            "{data.verseText}"
          </blockquote>
        )}

        {/* Reveal insight */}
        {hasReveal && data.insightText && (
          <>
            <div className="flex items-center justify-center gap-3 my-8">
              <div className="h-px w-6 bg-[#542A22]/30" />
              <span className="text-[#8B5E3C]/50 text-xs">✦</span>
              <div className="h-px w-6 bg-[#542A22]/30" />
            </div>
            <p
              className="text-center text-xs leading-relaxed"
              style={{ color: "#B8A898", fontFamily: "'Inter', sans-serif" }}
            >
              {data.insightText}
            </p>
          </>
        )}
      </div>

      {/* Footer branding */}
      <div className="relative z-10 pb-10 pt-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="h-px w-6 bg-[#542A22]/30" />
          <p
            className="text-[10px] tracking-[0.3em] uppercase"
            style={{ color: "#8B5E3C", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
          >
            via Revela
          </p>
          <div className="h-px w-6 bg-[#542A22]/30" />
        </div>
        <p
          className="text-[8px] tracking-[0.15em]"
          style={{ color: "#5C5046", fontFamily: "'Inter', sans-serif" }}
        >
          rrevela.lovable.app
        </p>
      </div>

      {/* Decorative bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#542A22] via-[#8B5E3C] to-[#542A22]" />
    </div>
  );
});

StoryCard.displayName = "StoryCard";

export default StoryCard;
