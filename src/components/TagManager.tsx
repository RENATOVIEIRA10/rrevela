import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Tag as TagIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Tag } from "@/hooks/useTags";

interface TagManagerProps {
  tags: Tag[];
  onCreateTag: (name: string) => Promise<Tag | undefined>;
  onDeleteTag: (tagId: string) => void;
  activeFilter: string | null;
  onFilterByTag: (tagId: string | null) => void;
}

const TagManager = ({ tags, onCreateTag, onDeleteTag, activeFilter, onFilterByTag }: TagManagerProps) => {
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName] = useState("");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await onCreateTag(newName);
    setNewName("");
    setShowInput(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-ui flex items-center gap-1.5">
          <TagIcon className="w-3 h-3" />
          Tags
        </p>
        <button
          onClick={() => setShowInput(!showInput)}
          className="text-[10px] text-accent hover:text-accent/80 transition-colors flex items-center gap-1 font-ui"
        >
          <Plus className="w-3 h-3" />
          Nova
        </button>
      </div>

      <AnimatePresence>
        {showInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="Nome da tag..."
                className="h-8 text-xs bg-secondary/30 border-border/30"
                autoFocus
              />
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="text-xs px-3 py-1 rounded-lg bg-accent text-accent-foreground font-ui disabled:opacity-40"
              >
                Criar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onFilterByTag(null)}
          className={`text-[10px] px-2.5 py-1 rounded-full font-ui transition-all ${
            activeFilter === null
              ? "bg-accent/15 text-accent border border-accent/25 font-medium"
              : "bg-secondary/30 text-foreground/60 border border-transparent hover:bg-secondary/50"
          }`}
        >
          Todos
        </button>

        {tags.map((tag) => (
          <div key={tag.id} className="flex items-center group">
            <button
              onClick={() => onFilterByTag(activeFilter === tag.id ? null : tag.id)}
              className={`text-[10px] px-2.5 py-1 rounded-full font-ui transition-all flex items-center gap-1 ${
                activeFilter === tag.id
                  ? "font-medium border"
                  : "border border-transparent hover:opacity-80"
              }`}
              style={{
                backgroundColor: activeFilter === tag.id ? `${tag.color}25` : `${tag.color}15`,
                color: tag.color,
                borderColor: activeFilter === tag.id ? `${tag.color}40` : "transparent",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
            </button>
            <button
              onClick={() => onDeleteTag(tag.id)}
              className="text-muted-foreground/0 group-hover:text-muted-foreground/60 hover:!text-destructive transition-all ml-0.5"
              aria-label={`Remover tag ${tag.name}`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagManager;
