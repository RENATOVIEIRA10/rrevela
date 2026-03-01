import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Eye, BookOpen, Cross, Lightbulb, Heart, Trash2, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { StructuredNote, NoteType } from "@/hooks/useNotes";

interface NoteField {
  key: keyof Pick<StructuredNote, "observation" | "interpretation" | "christocentric" | "application" | "prayer">;
  label: string;
  icon: React.ReactNode;
  hint: string;
  required: boolean;
}

const VERSE_FIELDS: NoteField[] = [
  { key: "observation", label: "Observação", icon: <Eye className="w-4 h-4" />, hint: "O que o texto realmente diz? Personagens, verbos, repetições, contrastes.", required: true },
  { key: "christocentric", label: "Cristocentrismo", icon: <Cross className="w-4 h-4" />, hint: "Como isso aponta para Cristo? Promessa, cumprimento, padrão, eco temático?", required: true },
  { key: "application", label: "Aplicação", icon: <Lightbulb className="w-4 h-4" />, hint: "O que o próprio texto encoraja ou adverte?", required: true },
];

const FULL_FIELDS: NoteField[] = [
  { key: "observation", label: "Observação", icon: <Eye className="w-4 h-4" />, hint: "O que o texto realmente diz? Personagens, verbos, repetições, contrastes, estrutura.", required: true },
  { key: "interpretation", label: "Interpretação", icon: <BookOpen className="w-4 h-4" />, hint: "O que isso significa no contexto original? Para quem foi escrito? Qual era a situação?", required: false },
  { key: "christocentric", label: "Cristocentrismo", icon: <Cross className="w-4 h-4" />, hint: "Como isso aponta para Cristo? Com base textual.", required: true },
  { key: "application", label: "Aplicação", icon: <Lightbulb className="w-4 h-4" />, hint: "O que o próprio texto encoraja ou adverte? Sem conselho inventado.", required: true },
  { key: "prayer", label: "Oração", icon: <Heart className="w-4 h-4" />, hint: "Transformar compreensão em resposta. (Opcional)", required: false },
];

interface NoteEditorProps {
  note?: StructuredNote;
  noteType: NoteType;
  book?: string;
  chapter?: number;
  verse?: number;
  onSave: (note: Partial<StructuredNote> & { type: NoteType }) => Promise<StructuredNote | null>;
  onDelete?: (id: string) => Promise<void>;
  onClose?: () => void;
  saving?: boolean;
}

const NoteEditor = ({
  note,
  noteType,
  book,
  chapter,
  verse,
  onSave,
  onDelete,
  onClose,
}: NoteEditorProps) => {
  const fields = noteType === "verse" ? VERSE_FIELDS : FULL_FIELDS;
  const [values, setValues] = useState<Record<string, string>>({});
  const [expandedField, setExpandedField] = useState<string | null>(fields[0].key);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setValues({
        observation: note.observation || "",
        interpretation: note.interpretation || "",
        christocentric: note.christocentric || "",
        application: note.application || "",
        prayer: note.prayer || "",
      });
    } else {
      setValues({});
    }
  }, [note]);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      ...(note ? { id: note.id } : {}),
      type: noteType,
      book,
      chapter,
      verse: verse ?? null,
      observation: values.observation || "",
      interpretation: values.interpretation || "",
      christocentric: values.christocentric || "",
      application: values.application || "",
      prayer: values.prayer || "",
    });
    setSaving(false);
    onClose?.();
  };

  const hasContent = Object.values(values).some((v) => v.trim());

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
          {noteType === "verse"
            ? "Nota de verso"
            : noteType === "chapter"
            ? "Nota de capítulo"
            : "Nota temática"}
        </p>
        {note && onDelete && (
          <button
            onClick={() => onDelete(note.id)}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Apagar
          </button>
        )}
      </div>

      {/* Fields */}
      <div className="space-y-2">
        {fields.map((field) => {
          const isExpanded = expandedField === field.key;
          const val = values[field.key] || "";
          return (
            <motion.div
              key={field.key}
              className="bg-card rounded-xl border border-border/50 overflow-hidden"
              layout
            >
              <button
                onClick={() => setExpandedField(isExpanded ? null : field.key)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
              >
                <span className="text-accent">{field.icon}</span>
                <span className="text-sm font-medium text-foreground flex-1">{field.label}</span>
                {val.trim() && !isExpanded && (
                  <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                    preenchido
                  </span>
                )}
                {!field.required && (
                  <span className="text-[10px] text-muted-foreground">opcional</span>
                )}
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {field.hint}
                      </p>
                      <Textarea
                        value={val}
                        onChange={(e) =>
                          setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                        placeholder="Escreva aqui…"
                        className="min-h-[80px] bg-secondary/30 border-0 font-scripture text-sm resize-none"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Save */}
      <div className="flex gap-2 pt-1">
        <Button
          onClick={handleSave}
          disabled={saving || !hasContent}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-scripture"
          size="sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
          {note ? "Atualizar" : "Salvar"}
        </Button>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
};

export default NoteEditor;
