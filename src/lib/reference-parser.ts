import { BIBLE_BOOKS } from "./bible-data";

export interface ParsedReference {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  raw: string;
}

// Build book name patterns for regex (sorted by length desc to match longest first)
const bookNames = BIBLE_BOOKS.map((b) => b.name).sort((a, b) => b.length - a.length);

// Also accept common abbreviations / no-accent variants
const ALIASES: Record<string, string> = {
  "Gn": "Gênesis", "Gên": "Gênesis", "Genesis": "Gênesis",
  "Ex": "Êxodo", "Êx": "Êxodo", "Exodo": "Êxodo",
  "Lv": "Levítico", "Lev": "Levítico", "Levitico": "Levítico",
  "Nm": "Números", "Num": "Números", "Numeros": "Números",
  "Dt": "Deuteronômio", "Deut": "Deuteronômio", "Deuteronomio": "Deuteronômio",
  "Js": "Josué", "Jos": "Josué", "Josue": "Josué",
  "Jz": "Juízes", "Juizes": "Juízes",
  "Rt": "Rute",
  "1Sm": "1 Samuel", "1 Sm": "1 Samuel",
  "2Sm": "2 Samuel", "2 Sm": "2 Samuel",
  "1Rs": "1 Reis", "1 Rs": "1 Reis",
  "2Rs": "2 Reis", "2 Rs": "2 Reis",
  "1Cr": "1 Crônicas", "1 Cr": "1 Crônicas", "1 Cronicas": "1 Crônicas",
  "2Cr": "2 Crônicas", "2 Cr": "2 Crônicas", "2 Cronicas": "2 Crônicas",
  "Ed": "Esdras", "Esd": "Esdras",
  "Ne": "Neemias",
  "Et": "Ester",
  "Sl": "Salmos", "Sal": "Salmos",
  "Pv": "Provérbios", "Prov": "Provérbios", "Proverbios": "Provérbios",
  "Ec": "Eclesiastes", "Ecl": "Eclesiastes",
  "Ct": "Cantares", "Cnt": "Cantares",
  "Is": "Isaías", "Isa": "Isaías", "Isaias": "Isaías",
  "Jr": "Jeremias", "Jer": "Jeremias",
  "Lm": "Lamentações", "Lam": "Lamentações", "Lamentacoes": "Lamentações",
  "Ez": "Ezequiel", "Eze": "Ezequiel",
  "Dn": "Daniel", "Dan": "Daniel",
  "Os": "Oséias", "Ose": "Oséias", "Oseias": "Oséias",
  "Jl": "Joel",
  "Am": "Amós", "Amos": "Amós",
  "Ob": "Obadias",
  "Jn": "Jonas",
  "Mq": "Miquéias", "Miq": "Miquéias", "Miqueias": "Miquéias",
  "Na": "Naum",
  "Hc": "Habacuque", "Hab": "Habacuque",
  "Sf": "Sofonias", "Sof": "Sofonias",
  "Ag": "Ageu",
  "Zc": "Zacarias", "Zac": "Zacarias",
  "Ml": "Malaquias", "Mal": "Malaquias",
  "Mt": "Mateus", "Mat": "Mateus",
  "Mc": "Marcos", "Mar": "Marcos",
  "Lc": "Lucas", "Luc": "Lucas",
  "Jo": "João", "Joo": "João", "Joao": "João",
  "At": "Atos",
  "Rm": "Romanos", "Rom": "Romanos",
  "1Co": "1 Coríntios", "1 Co": "1 Coríntios", "1 Corintios": "1 Coríntios",
  "2Co": "2 Coríntios", "2 Co": "2 Coríntios", "2 Corintios": "2 Coríntios",
  "Gl": "Gálatas", "Gal": "Gálatas", "Galatas": "Gálatas",
  "Ef": "Efésios", "Efe": "Efésios", "Efesios": "Efésios",
  "Fp": "Filipenses", "Fil": "Filipenses",
  "Cl": "Colossenses", "Col": "Colossenses",
  "1Ts": "1 Tessalonicenses", "1 Ts": "1 Tessalonicenses",
  "2Ts": "2 Tessalonicenses", "2 Ts": "2 Tessalonicenses",
  "1Tm": "1 Timóteo", "1 Tm": "1 Timóteo", "1 Timoteo": "1 Timóteo",
  "2Tm": "2 Timóteo", "2 Tm": "2 Timóteo", "2 Timoteo": "2 Timóteo",
  "Tt": "Tito",
  "Fm": "Filemom",
  "Hb": "Hebreus", "Heb": "Hebreus",
  "Tg": "Tiago", "Tia": "Tiago",
  "1Pe": "1 Pedro", "1 Pe": "1 Pedro",
  "2Pe": "2 Pedro", "2 Pe": "2 Pedro",
  "1Jo": "1 João", "1 Jo": "1 João", "1 Joao": "1 João",
  "2Jo": "2 João", "2 Jo": "2 João", "2 Joao": "2 João",
  "3Jo": "3 João", "3 Jo": "3 João", "3 Joao": "3 João",
  "Jd": "Judas",
  "Ap": "Apocalipse",
};

function resolveBookName(raw: string): string | null {
  const trimmed = raw.trim();
  // Direct match
  if (BIBLE_BOOKS.some((b) => b.name === trimmed)) return trimmed;
  // Alias match
  if (ALIASES[trimmed]) return ALIASES[trimmed];
  // Case-insensitive match
  const lower = trimmed.toLowerCase();
  const found = BIBLE_BOOKS.find((b) => b.name.toLowerCase() === lower);
  if (found) return found.name;
  // Alias case-insensitive
  for (const [alias, name] of Object.entries(ALIASES)) {
    if (alias.toLowerCase() === lower) return name;
  }
  return null;
}

// Build regex: matches "Book chapter:verse[-verseEnd]"
// Supports en-dash and hyphen for ranges
const allBookPatterns = [
  ...bookNames.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
  ...Object.keys(ALIASES).sort((a, b) => b.length - a.length).map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
];

const BOOK_PATTERN = allBookPatterns.join("|");
const REF_REGEX = new RegExp(
  `(${BOOK_PATTERN})\\s*(\\d{1,3})\\s*[:.]\\s*(\\d{1,3})(?:\\s*[-–]\\s*(\\d{1,3}))?`,
  "gi"
);

export function parseReferences(text: string): ParsedReference[] {
  const refs: ParsedReference[] = [];
  let match: RegExpExecArray | null;
  const regex = new RegExp(REF_REGEX.source, REF_REGEX.flags);
  
  while ((match = regex.exec(text)) !== null) {
    const bookRaw = match[1].trim();
    const book = resolveBookName(bookRaw);
    if (!book) continue;
    
    const chapter = parseInt(match[2], 10);
    const verseStart = parseInt(match[3], 10);
    const verseEnd = match[4] ? parseInt(match[4], 10) : undefined;
    
    refs.push({
      book,
      chapter,
      verseStart,
      verseEnd,
      raw: match[0],
    });
  }
  
  return refs;
}

/**
 * Splits text into segments: plain text and reference matches.
 * Returns an array of { type: 'text' | 'ref', content, ref? }
 */
export interface TextSegment {
  type: "text";
  content: string;
}

export interface RefSegment {
  type: "ref";
  content: string;
  ref: ParsedReference;
}

export type Segment = TextSegment | RefSegment;

export function segmentText(text: string): Segment[] {
  const segments: Segment[] = [];
  const regex = new RegExp(REF_REGEX.source, REF_REGEX.flags);
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const bookRaw = match[1].trim();
    const book = resolveBookName(bookRaw);
    if (!book) continue;

    if (match.index > lastIndex) {
      segments.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }

    const chapter = parseInt(match[2], 10);
    const verseStart = parseInt(match[3], 10);
    const verseEnd = match[4] ? parseInt(match[4], 10) : undefined;

    segments.push({
      type: "ref",
      content: match[0],
      ref: { book, chapter, verseStart, verseEnd, raw: match[0] },
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", content: text.slice(lastIndex) });
  }

  return segments;
}
