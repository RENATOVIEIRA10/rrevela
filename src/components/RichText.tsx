import { segmentText } from "@/lib/reference-parser";
import ReferenceChip from "./ReferenceChip";

interface RichTextProps {
  text: string;
  className?: string;
  onNavigate?: (book: string, chapter: number, verse: number) => void;
}

/**
 * Renders text with biblical references automatically converted to clickable chips.
 */
const RichText = ({ text, className, onNavigate }: RichTextProps) => {
  const segments = segmentText(text);

  if (segments.length === 1 && segments[0].type === "text") {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {segments.map((seg, i) => {
        if (seg.type === "text") {
          return <span key={i}>{seg.content}</span>;
        }
        return (
          <ReferenceChip
            key={i}
            reference={seg.ref}
            label={seg.content}
            onNavigate={onNavigate}
          />
        );
      })}
    </span>
  );
};

export default RichText;
