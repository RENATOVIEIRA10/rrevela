import { BIBLE_BOOKS } from "./bible-data";

export interface ReadingEntry {
  book: string;
  chapter: number;
}

export interface DayReading {
  day: number;
  entries: ReadingEntry[];
  label: string;
}

export interface ReadingPlan {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  totalDays: number;
  emoji: string;
  schedule: DayReading[];
}

function groupByBook(entries: ReadingEntry[]): { book: string; chapters: number[] }[] {
  const groups: { book: string; chapters: number[] }[] = [];
  for (const e of entries) {
    const last = groups[groups.length - 1];
    if (last && last.book === e.book) {
      last.chapters.push(e.chapter);
    } else {
      groups.push({ book: e.book, chapters: [e.chapter] });
    }
  }
  return groups;
}

function buildSchedule(
  books: { name: string; chapters: number }[],
  totalDays: number
): DayReading[] {
  const all: ReadingEntry[] = [];
  for (const b of books) {
    for (let c = 1; c <= b.chapters; c++) {
      all.push({ book: b.name, chapter: c });
    }
  }

  const days: DayReading[] = [];
  const total = all.length;

  for (let d = 0; d < totalDays; d++) {
    const start = Math.round((d / totalDays) * total);
    const end = Math.round(((d + 1) / totalDays) * total);
    const entries = all.slice(start, end);

    let label = "Dia de revisão";
    if (entries.length > 0) {
      const grouped = groupByBook(entries);
      label = grouped
        .map((g) => {
          if (g.chapters.length === 1) return `${g.book} ${g.chapters[0]}`;
          return `${g.book} ${g.chapters[0]}–${g.chapters[g.chapters.length - 1]}`;
        })
        .join(", ");
    }

    days.push({ day: d + 1, entries, label });
  }

  return days;
}

const NT_BOOKS = BIBLE_BOOKS.filter((b) => b.testament === "NT");
const PSALMS_ONLY = [{ name: "Salmos", chapters: 150 }];

export const READING_PLANS: ReadingPlan[] = [
  {
    id: "nt_90",
    name: "NT em 90 Dias",
    subtitle: "Novo Testamento completo",
    description: "Percorra todo o Novo Testamento em 3 meses, com cerca de 3 capítulos por dia.",
    totalDays: 90,
    emoji: "✝️",
    schedule: buildSchedule(NT_BOOKS, 90),
  },
  {
    id: "salmos_30",
    name: "Salmos em 30 Dias",
    subtitle: "Poesia e adoração",
    description: "Medite em todos os 150 Salmos ao longo de um mês, com 5 salmos por dia.",
    totalDays: 30,
    emoji: "🎵",
    schedule: buildSchedule(PSALMS_ONLY, 30),
  },
  {
    id: "biblia_1_ano",
    name: "Bíblia em 1 Ano",
    subtitle: "Toda a Palavra de Deus",
    description: "A jornada completa do Gênesis ao Apocalipse em 365 dias.",
    totalDays: 365,
    emoji: "📖",
    schedule: buildSchedule(BIBLE_BOOKS, 365),
  },
];

export function getPlanById(id: string): ReadingPlan | undefined {
  return READING_PLANS.find((p) => p.id === id);
}

export function getCurrentDayNumber(startedAt: string, totalDays: number): number {
  const start = new Date(startedAt);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(1, diff + 1), totalDays);
}
