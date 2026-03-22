import { useState } from "react";
import { Heart, ArrowRight, Loader2, Download, Copy, Share2, Check, Tag as TagIcon, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { FavoriteVerse } from "@/hooks/useFavorites";
import type { Tag } from "@/hooks/useTags";
import TagManager from "./TagManager";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FavoritesListProps {
  favorites: FavoriteVerse[];
  loading: boolean;
  onGoTo: (book: string, chapter: number, verse: number) => void;
  onRemove: (book: string, chapter: number, verse: number) => void;
  // Tags
  tags: Tag[];
  tagsLoading: boolean;
  onCreateTag: (name: string) => Promise<Tag | undefined>;
  onDeleteTag: (tagId: string) => void;
  onAssignTag: (favoriteId: string, tagId: string) => void;
  onRemoveTag: (favoriteId: string, tagId: string) => void;
  getTagsForFavorite: (favoriteId: string) => Tag[];
  getFavoritesForTag: (tagId: string) => string[];
}

const FavoritesList = ({
  favorites, loading, onGoTo, onRemove,
  tags, tagsLoading, onCreateTag, onDeleteTag,
  onAssignTag, onRemoveTag, getTagsForFavorite, getFavoritesForTag,
}: FavoritesListProps) => {
  const [copied, setCopied] = useState(false);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);

  const filteredFavorites = activeTagFilter
    ? favorites.filter((fav) => getFavoritesForTag(activeTagFilter).includes(fav.id))
    : favorites;

  const generateExportText = () => {
    const header = "📖 Meus Versículos Favoritos\n" + "─".repeat(30) + "\n\n";
    const verses = filteredFavorites
      .map((fav) => {
        const favTags = getTagsForFavorite(fav.id);
        const tagStr = favTags.length > 0 ? ` [${favTags.map((t) => t.name).join(", ")}]` : "";
        return `${fav.book} ${fav.chapter}:${fav.verse}${tagStr}\n"${fav.text || ""}"\n`;
      })
      .join("\n");
    const footer = `\n─────\nExportado do Revela • ${new Date().toLocaleDateString("pt-BR")}`;
    return header + verses + footer;
  };

  const handleCopy = async () => {
    const text = generateExportText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Favoritos copiados!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  const handleShare = async () => {
    const text = generateExportText();
    if (navigator.share) {
      try {
        await navigator.share({ title: "Meus Versículos Favoritos", text });
      } catch (e) {
        if ((e as Error).name !== "AbortError") handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleDownload = () => {
    const text = generateExportText();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `favoritos-revela-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Arquivo baixado!");
  };

  if (loading || tagsLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-6 space-y-2">
        <Heart className="w-5 h-5 mx-auto text-muted-foreground/50" />
        <p className="text-xs text-muted-foreground">Nenhum versículo favorito ainda.</p>
        <p className="text-[10px] text-muted-foreground/70">
          Toque no ❤️ ao abrir um versículo no Leitor para salvar aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tag manager & filter */}
      <TagManager
        tags={tags}
        onCreateTag={onCreateTag}
        onDeleteTag={onDeleteTag}
        activeFilter={activeTagFilter}
        onFilterByTag={setActiveTagFilter}
      />

      {/* Export actions */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground font-ui">
          {filteredFavorites.length} versículo{filteredFavorites.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-accent transition-colors px-2 py-1 rounded-lg hover:bg-secondary/50"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copiado" : "Copiar"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-accent transition-colors px-2 py-1 rounded-lg hover:bg-secondary/50"
          >
            <Download className="w-3 h-3" />
            .txt
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-[10px] text-accent hover:text-accent/80 transition-colors px-2 py-1 rounded-lg hover:bg-accent/10"
          >
            <Share2 className="w-3 h-3" />
            Compartilhar
          </button>
        </div>
      </div>

      {/* Favorites list */}
      {filteredFavorites.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">
          Nenhum favorito com esta tag.
        </p>
      ) : (
        filteredFavorites.map((fav, i) => {
          const favTags = getTagsForFavorite(fav.id);

          return (
            <motion.div
              key={fav.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors group"
            >
              <button
                onClick={() => onRemove(fav.book, fav.chapter, fav.verse)}
                className="mt-0.5 text-accent hover:text-destructive transition-colors shrink-0"
                aria-label="Remover favorito"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
              </button>

              <div className="flex-1 min-w-0 space-y-1.5">
                <p className="text-xs font-ui font-medium text-accent/80">
                  {fav.book} {fav.chapter}:{fav.verse}
                </p>
                {fav.text && (
                  <p className="text-sm font-scripture text-foreground/80 italic line-clamp-2 leading-relaxed">
                    {fav.text}
                  </p>
                )}

                {/* Tags on this favorite */}
                <div className="flex flex-wrap items-center gap-1">
                  {favTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => onRemoveTag(fav.id, tag.id)}
                      className="text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 hover:opacity-60 transition-opacity"
                      style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                      title={`Remover tag "${tag.name}"`}
                    >
                      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: tag.color }} />
                      {tag.name}
                    </button>
                  ))}

                  {/* Add tag popover */}
                  {tags.length > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="text-muted-foreground/40 hover:text-accent transition-colors p-0.5">
                          <Plus className="w-3 h-3" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-44 p-2 space-y-1" align="start">
                        <p className="text-[10px] text-muted-foreground font-ui px-1 pb-1">Adicionar tag</p>
                        {tags
                          .filter((t) => !favTags.some((ft) => ft.id === t.id))
                          .map((tag) => (
                            <button
                              key={tag.id}
                              onClick={() => onAssignTag(fav.id, tag.id)}
                              className="w-full text-left text-xs px-2 py-1.5 rounded-md hover:bg-secondary/50 flex items-center gap-2 font-ui transition-colors"
                            >
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: tag.color }}
                              />
                              {tag.name}
                            </button>
                          ))}
                        {tags.filter((t) => !favTags.some((ft) => ft.id === t.id)).length === 0 && (
                          <p className="text-[10px] text-muted-foreground/60 px-2 py-1">
                            Todas as tags já adicionadas
                          </p>
                        )}
                      </PopoverContent>
                    </Popover>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {new Date(fav.created_at).toLocaleDateString("pt-BR")}
                  </span>
                  <button
                    onClick={() => onGoTo(fav.book, fav.chapter, fav.verse)}
                    className="flex items-center gap-1 text-[10px] text-accent/70 hover:text-accent transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <ArrowRight className="w-3 h-3" />
                    Ir
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
};

export default FavoritesList;
