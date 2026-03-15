import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Type, BookOpen, Sun, Moon, LogOut, ChevronRight, Check, Loader2 } from "lucide-react";
import OfflineDownloadButton from "@/components/OfflineDownloadButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const FONT_SIZES = [
  { label: "Pequeno", value: "sm", sample: "text-[0.9375rem]" },
  { label: "Médio", value: "md", sample: "text-[1.125rem]" },
  { label: "Grande", value: "lg", sample: "text-[1.3125rem]" },
];

const TRANSLATIONS = [
  { label: "Almeida Corrigida Fiel", value: "acf" },
  { label: "Almeida Revista e Corrigida", value: "arc" },
  { label: "Almeida Atualizada", value: "aa" },
  { label: "Tradução Brasileira 1917", value: "tb" },
];

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const Perfil = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Reading preferences (localStorage)
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("revela-font-size") || "md");
  const [translation, setTranslation] = useState(() => localStorage.getItem("revela-translation") || "acf");

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .single();
      if (data?.display_name) {
        setDisplayName(data.display_name);
        setOriginalName(data.display_name);
      }
      setLoadingProfile(false);
    };
    loadProfile();
  }, [user]);

  const handleSaveName = async () => {
    if (!user || !displayName.trim() || displayName === originalName) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível salvar o nome.", variant: "destructive" });
    } else {
      setOriginalName(displayName.trim());
      toast({ title: "Nome atualizado", description: "Seu nome foi salvo com sucesso." });
    }
  };

  const handleFontSize = (value: string) => {
    setFontSize(value);
    localStorage.setItem("revela-font-size", value);
  };

  const handleTranslation = (value: string) => {
    setTranslation(value);
    localStorage.setItem("revela-translation", value);
  };

  const nameChanged = displayName.trim() !== originalName && displayName.trim().length > 0;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="glass-surface border-b border-border/40 px-5 py-3.5 safe-top">
        <h1 className="font-scripture text-base font-semibold text-foreground text-center tracking-wide">
          Meu Perfil
        </h1>
        <div className="editorial-divider mt-3" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto w-full px-5 py-6 space-y-8">
          {/* Avatar & Email */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="flex flex-col items-center space-y-3"
          >
            <div className="w-16 h-16 rounded-full bg-primary/[0.06] flex items-center justify-center">
              <User className="w-7 h-7 text-primary/50" strokeWidth={1.5} />
            </div>
            <p className="text-[0.8125rem] text-muted-foreground">
              {user?.email}
            </p>
          </motion.div>

          {/* Display Name */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease }}
            className="space-y-3"
          >
            <SectionLabel icon={<User className="w-3.5 h-3.5" />} label="Nome de exibição" />
            <div className="flex gap-2">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={loadingProfile ? "Carregando…" : "Seu nome"}
                disabled={loadingProfile}
                className="h-11 bg-card/80 border-border/60 text-[0.875rem] font-scripture placeholder:text-muted-foreground/40 focus:border-primary/30 focus:ring-primary/10"
              />
              <Button
                onClick={handleSaveName}
                disabled={!nameChanged || saving}
                size="icon"
                className="h-11 w-11 shrink-0"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </Button>
            </div>
          </motion.section>

          <div className="editorial-divider" />

          {/* Font Size */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4, ease }}
            className="space-y-3"
          >
            <SectionLabel icon={<Type className="w-3.5 h-3.5" />} label="Tamanho do texto" />
            <div className="grid grid-cols-3 gap-2">
              {FONT_SIZES.map((fs) => (
                <button
                  key={fs.value}
                  onClick={() => handleFontSize(fs.value)}
                  className={`notebook-page rounded-lg py-3 px-2 text-center transition-all duration-200 ${
                    fontSize === fs.value
                      ? "border-primary/30 ring-1 ring-primary/20"
                      : "hover:border-border"
                  }`}
                >
                  <span className={`font-scripture block ${fs.sample} text-foreground/80`}>Aa</span>
                  <span className="text-[0.6875rem] text-muted-foreground mt-1 block">{fs.label}</span>
                </button>
              ))}
            </div>
          </motion.section>

          <div className="editorial-divider" />

          {/* Translation */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease }}
            className="space-y-3"
          >
            <SectionLabel icon={<BookOpen className="w-3.5 h-3.5" />} label="Tradução padrão" />
            <div className="space-y-1.5">
              {TRANSLATIONS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => handleTranslation(t.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                    translation === t.value
                      ? "notebook-page border-primary/30 ring-1 ring-primary/20"
                      : "hover:bg-secondary/50"
                  }`}
                >
                  <span className="text-[0.8125rem] text-foreground/80 font-medium">{t.label}</span>
                  {translation === t.value && (
                    <Check className="w-4 h-4 text-primary/70" />
                  )}
                </button>
              ))}
            </div>
          </motion.section>

          <div className="editorial-divider" />

          {/* Offline Download */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.4, ease }}
            className="notebook-page rounded-xl p-4"
          >
            <OfflineDownloadButton />
          </motion.section>

          <div className="editorial-divider" />

          {/* Theme Toggle */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4, ease }}
          >
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {theme === "dark" ? (
                  <Moon className="w-4 h-4 text-primary/60" />
                ) : (
                  <Sun className="w-4 h-4 text-primary/60" />
                )}
                <span className="text-[0.8125rem] text-foreground/80 font-medium">
                  {theme === "dark" ? "Modo escuro" : "Modo claro"}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
            </button>
          </motion.section>

          <div className="editorial-divider" />

          {/* Sign Out */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease }}
          >
            <button
              onClick={signOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-destructive/70 hover:bg-destructive/[0.06] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-[0.8125rem] font-medium">Sair da conta</span>
            </button>
          </motion.section>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-center text-[0.6875rem] text-muted-foreground/35 pt-4 pb-6 tracking-wide"
          >
            Revela — Estudo Bíblico Cristocêntrico
          </motion.p>
        </div>
      </div>
    </div>
  );
};

const SectionLabel = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex items-center gap-2">
    <span className="text-primary/50">{icon}</span>
    <span className="text-[0.6875rem] uppercase tracking-[0.12em] font-semibold text-primary/60">
      {label}
    </span>
  </div>
);

export default Perfil;
