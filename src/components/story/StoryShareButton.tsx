import { useState } from "react";
import { Camera } from "lucide-react";
import StoryShareSheet from "./StoryShareSheet";
import { type StoryData } from "./StoryCard";

interface StoryShareButtonProps {
  data: StoryData;
  className?: string;
  variant?: "icon" | "full";
}

const StoryShareButton = ({ data, className = "", variant = "full" }: StoryShareButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-border bg-secondary/50 text-foreground/80 hover:bg-secondary transition-colors active:scale-95 ${className}`}
      >
        <Camera className="w-3.5 h-3.5" />
        {variant === "full" && <span>Story</span>}
      </button>

      <StoryShareSheet open={open} onOpenChange={setOpen} data={data} />
    </>
  );
};

export default StoryShareButton;
