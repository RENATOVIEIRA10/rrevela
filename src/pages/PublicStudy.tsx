import { useParams, useSearchParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, BookOpen, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import RevelaLogo from "@/components/RevelaLogo";

const MODE_LABELS: Record<string, string> = {
  essencial: "Essencial",
  intermediario: "Intermediário",
  profundo: "Profundo",
  messianica: "Linha Messiânica",
  padroes: "Padrões Bíblicos",
  harmonia: "Harmonia Bíblica",
};

const PublicStudy = () => {
  const { book, chapter } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "essencial";

  const bookDecoded = decodeURIComponent(book || "");
  const chapterNum = Number(chapter);
  const modeLabel = MODE_LABELS[mode] || mode;

  const [study, setStudy] = useState<{ title: string; share_text: string; insight_text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("shared_studies" as any)
        .select("title, share_text, insight_text")
        .eq("book", bookDecoded)
        .eq("chapter", chapterNum)
        .eq("mode", mode)
        .order("created_at", { ascending: false })
        .limit(1);

      if (data && (data as any[]).length > 0) {
        setStudy((data as any[])[0]);
      }
      setLoading(false);
    };
    load();
  }, [bookDecoded, chapterNum, mode]);

  useEffect(() => {
    document.title = `Estudo ${modeLabel}: ${bookDecoded} ${chapterNum} — Revela`;
  }, [bookDecoded, chapterNum, modeLabel]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-4 py-3 flex items-center gap-3">
        <RevelaLogo size={28} />
        <span className="font-scripture text-sm text-muted-foreground">Revela</span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-xl mx-auto text-center">
        <p className="text-xs uppercase tracking-widest text-accent font-ui font-semibold mb-2">
          Estudo {modeLabel}
        </p>
        <h1 className="font-scripture text-xl font-semibold text-foreground mb-6">
          {bookDecoded} {chapterNum}
        </h1>

        {study ? (
          <>
            {study.title && (
              <h2 className="font-scripture text-lg text-foreground/90 mb-4">{study.title}</h2>
            )}
            {study.insight_text && (
              <div className="notebook-page rounded-lg px-5 py-4 mb-8 text-left w-full">
                <p className="text-xs text-accent font-ui font-semibold mb-1.5">Trecho do estudo</p>
                <p className="font-scripture text-sm text-foreground/80 leading-relaxed">{study.insight_text}</p>
              </div>
            )}
          </>
        ) : (
          <div className="notebook-page rounded-lg px-5 py-4 mb-8 text-left w-full">
            <p className="text-xs text-accent font-ui font-semibold mb-1.5">Estudo disponível no app</p>
            <p className="font-scripture text-sm text-foreground/80 leading-relaxed">
              Abra o Revela para ver o estudo completo de {bookDecoded} {chapterNum} no modo {modeLabel}.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 w-full mt-4">
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

export default PublicStudy;
