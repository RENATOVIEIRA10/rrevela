// Redemption history timeline mapping
// Maps Bible books to eras in the History of Redemption

export interface RedemptionEra {
  key: string;
  label: string;
  emoji: string;
  description: string;
  books: string[];
}

export const REDEMPTION_ERAS: RedemptionEra[] = [
  {
    key: "criacao",
    label: "Criação",
    emoji: "🌅",
    description: "Deus cria todas as coisas e estabelece sua relação com a humanidade",
    books: ["Gênesis"],
  },
  {
    key: "promessa",
    label: "Promessa",
    emoji: "🌟",
    description: "Deus faz alianças e promete um redentor",
    books: ["Gênesis", "Êxodo"],
  },
  {
    key: "israel",
    label: "Israel",
    emoji: "⛺",
    description: "Deus forma um povo para si e revela sua Lei",
    books: [
      "Êxodo", "Levítico", "Números", "Deuteronômio",
      "Josué", "Juízes", "Rute",
      "1 Samuel", "2 Samuel", "1 Reis", "2 Reis",
      "1 Crônicas", "2 Crônicas",
      "Esdras", "Neemias", "Ester",
      "Jó", "Salmos", "Provérbios", "Eclesiastes", "Cantares",
      "Isaías", "Jeremias", "Lamentações", "Ezequiel", "Daniel",
      "Oséias", "Joel", "Amós", "Obadias", "Jonas",
      "Miquéias", "Naum", "Habacuque", "Sofonias",
      "Ageu", "Zacarias", "Malaquias",
    ],
  },
  {
    key: "messias",
    label: "Messias",
    emoji: "✝️",
    description: "Cristo cumpre as promessas — vida, morte e ressurreição",
    books: ["Mateus", "Marcos", "Lucas", "João"],
  },
  {
    key: "igreja",
    label: "Igreja",
    emoji: "🕊️",
    description: "O Espírito forma a Igreja e expande o evangelho",
    books: [
      "Atos",
      "Romanos", "1 Coríntios", "2 Coríntios",
      "Gálatas", "Efésios", "Filipenses", "Colossenses",
      "1 Tessalonicenses", "2 Tessalonicenses",
      "1 Timóteo", "2 Timóteo", "Tito", "Filemom",
      "Hebreus", "Tiago", "1 Pedro", "2 Pedro",
      "1 João", "2 João", "3 João", "Judas",
    ],
  },
  {
    key: "consumacao",
    label: "Consumação",
    emoji: "👑",
    description: "Cristo retorna e restaura todas as coisas",
    books: ["Apocalipse"],
  },
];

// Special chapter-level mappings for books that span multiple eras
const CHAPTER_ERA_OVERRIDES: Record<string, { chapters: [number, number]; era: string }[]> = {
  "Gênesis": [
    { chapters: [1, 11], era: "criacao" },
    { chapters: [12, 50], era: "promessa" },
  ],
  "Êxodo": [
    { chapters: [1, 15], era: "promessa" },
    { chapters: [16, 40], era: "israel" },
  ],
};

export function getEraForPassage(book: string, chapter: number): RedemptionEra | null {
  // Check chapter-level overrides first
  const overrides = CHAPTER_ERA_OVERRIDES[book];
  if (overrides) {
    for (const override of overrides) {
      if (chapter >= override.chapters[0] && chapter <= override.chapters[1]) {
        return REDEMPTION_ERAS.find((e) => e.key === override.era) ?? null;
      }
    }
  }

  // Fall back to book-level mapping
  for (const era of REDEMPTION_ERAS) {
    if (era.books.includes(book)) {
      return era;
    }
  }

  return null;
}

export function getEraIndex(eraKey: string): number {
  return REDEMPTION_ERAS.findIndex((e) => e.key === eraKey);
}
