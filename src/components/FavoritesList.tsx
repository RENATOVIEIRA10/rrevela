import { Heart, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { FavoriteVerse } from "@/hooks/useFavorites";

interface FavoritesListProps {
  favorites: FavoriteVerse[];
  loading: boolean;
  onGoTo: (book: string, chapter: number, verse: number) => void;
  onRemove: (book: string, chapter: number, verse: number) => void;
}

const FavoritesList = ({ favorites, loading, onGoTo, onRemove }: FavoritesListProps) => {
  if (loading) {
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
    <div className="space-y-2">
      {favorites.map((fav, i) => (
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

          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-xs font-ui font-medium text-accent/80">
              {fav.book} {fav.chapter}:{fav.verse}
            </p>
            {fav.text && (
              <p className="text-sm font-scripture text-foreground/80 italic line-clamp-2 leading-relaxed">
                {fav.text}
              </p>
            )}
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
      ))}
    </div>
  );
};

export default FavoritesList;
