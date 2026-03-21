import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, BookOpen, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import RevelaLogo from "@/components/RevelaLogo";

const PublicVerse = () => {
  const { book, chapter, verse } = useParams();
  const [verseData, setVerseData] = useState<{ text: string } | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const bookDecoded = decodeURIComponent(book || "");
  const chapterNum = Number(chapter);
  const verseNum = Number(verse);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // Fetch verse text
      const { data: verseRows } = await supabase
        .from("bible_verses")
        .select("text")
        .eq("book", bookDecoded)
        .eq("chapter", chapterNum)
        .eq("verse", verseNum)
        .eq("translation", "arc")
        .limit(1);

      if (verseRows && verseRows.length > 0) {
        setVerseData(verseRows[0]);
      }

      // Fetch latest shared insight for this verse
      const { data: shares } = await supabase
        .from("shared_verses")
        .select("insight_text")
        .eq("book", bookDecoded)
        .eq("chapter", chapterNum)
        .eq("verse", verseNum)
        .order("created_at", { ascending: false })
        .limit(1);

      if (shares && shares.length > 0 && shares[0].insight_text) {
        setInsight(shares[0].insight_text);
      }

      setLoading(false);
    };
    load();
  }, [bookDecoded, chapterNum, verseNum]);

  // Update document title for OG
  useEffect(() => {
    document.title = `${bookDecoded} ${chapterNum}:${verseNum} — Revela`;
  }, [bookDecoded, chapterNum, verseNum]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center gap-3">
        <RevelaLogo size={28} />
        <span className="font-scripture text-sm text-muted-foreground">Revela</span>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-xl mx-auto text-center">
        <p className="text-xs uppercase tracking-widest text-accent font-ui font-semibold mb-4">
          {bookDecoded} {chapterNum}:{verseNum}
        </p>

        {verseData ? (
          <blockquote className="accent-border font-scripture text-xl leading-relaxed text-foreground/90 italic mb-6">
            "{verseData.text}"
          </blockquote>
        ) : (
          <p className="text-muted-foreground mb-6">Versículo não encontrado.</p>
        )}

        {insight && (
          <div className="notebook-page rounded-lg px-5 py-4 mb-8 text-left w-full">
            <p className="text-xs text-accent font-ui font-semibold mb-1.5">Revela</p>
            <p className="font-scripture text-sm text-foreground/80 leading-relaxed">{insight}</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground mb-1">(Almeida Corrigida Fiel)</p>

        {/* CTAs */}
        <div className="flex flex-col gap-3 w-full mt-8">
          <Button asChild className="w-full gap-2">
            <Link to={`/leitor?livro=${encodeURIComponent(bookDecoded)}&cap=${chapterNum}`}>
              <BookOpen className="w-4 h-4" />
              Abrir no Revela
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full gap-2">
            <Link to="/install">
              <Download className="w-4 h-4" />
              Instalar o Revela
            </Link>
          </Button>
        </div>

        {/* Mini about */}
        <div className="mt-12 border-t border-border pt-8 w-full text-left">
          <h2 className="font-scripture text-base font-semibold text-foreground mb-2">O que é o Revela?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Um estudo bíblico cristocêntrico — profundo, silencioso, fundamentado exclusivamente na Escritura.
            Sem achismo, sem misticismo. Cada conexão vem com referência e grau de confiança.
          </p>
          <Link to="/auth" className="text-sm text-accent hover:underline inline-flex items-center gap-1">
            Criar conta gratuita <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </main>
    </div>
  );
};

export default PublicVerse;
