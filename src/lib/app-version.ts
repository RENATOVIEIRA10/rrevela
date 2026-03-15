/**
 * Revela — Internal Versioning & Changelog System
 * 
 * Bump APP_VERSION on each release and add a changelog entry.
 * The WhatsNew component reads this to show updates once per version.
 */

export const APP_VERSION = "1.3.0";

export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.3.0",
    date: "2026-03-15",
    title: "Novas traduções e leitura offline",
    changes: [
      "📖 Tradução Brasileira 1917 e Almeida Revista e Corrigida adicionadas",
      "📶 Download offline completo da Bíblia",
      "🔍 Citações bíblicas clicáveis no modo Revela",
      "🔎 Zoom com gesto de pinça nos painéis de revelação",
      "📸 Novos templates para compartilhar versículos como Story",
      "⚡ Melhorias de estabilidade e navegação",
    ],
  },
  {
    version: "1.2.0",
    date: "2026-03-01",
    title: "Modo Revelação aprimorado",
    changes: [
      "💡 Novos modos de profundidade no estudo bíblico",
      "🔗 Referências cruzadas interativas",
      "📝 Caderno de anotações estruturado",
      "🎨 Destaques com categorias teológicas",
    ],
  },
];

/** Check if the user has seen this version's changelog */
export function hasSeenVersion(version: string): boolean {
  const lastSeen = localStorage.getItem("revela-last-seen-version");
  return lastSeen === version;
}

/** Mark the current version as seen */
export function markVersionSeen(version: string): void {
  localStorage.setItem("revela-last-seen-version", version);
}

/** Check if this is a new user (never completed onboarding) */
export function hasCompletedOnboarding(): boolean {
  return localStorage.getItem("revela-onboarding-complete") === "true";
}

/** Mark onboarding as complete */
export function markOnboardingComplete(): void {
  localStorage.setItem("revela-onboarding-complete", "true");
}

/** Get the latest changelog for the current version */
export function getCurrentChangelog(): ChangelogEntry | null {
  return CHANGELOG.find((c) => c.version === APP_VERSION) || null;
}
