/**
 * RevelaLogo — Símbolo Revela v3 "O Livro Aberto"
 *
 * Livro com páginas em leque acima de um "r" estilizado.
 * Quando animated=true, as páginas se abrem em sequência rápida
 * via animateTransform SMIL — sem dependências extra.
 *
 * Geometria (viewBox 0 0 200 225):
 *  - Eixo de rotação das páginas: (100, 146)
 *  - Páginas: 11 folhas, de -68° a +12° (a partir da vertical)
 *  - Letra "r": haste de (100,146) a (100,215), arco saindo a (134,162)
 */

/** Ângulos das 11 páginas em graus (–68° … +12°, espaço de 8°) */
const PAGE_ANGLES = [-68, -60, -52, -44, -36, -28, -20, -12, -4, 4, 12] as const;

/** Polígono base de uma folha, apontando para cima a partir do pivô (100,146).
 *  Base: 6 px | Ponta: 22 px | Comprimento: 90 px */
const BASE_POLY = "97,146 103,146 111,56 89,56";

const PIVOT_X = 100;
const PIVOT_Y = 146;

/** Rotaciona um ponto em torno do pivô para gerar o polígono final */
function rotatePoint(x: number, y: number, angleDeg: number): [number, number] {
  const r  = (angleDeg * Math.PI) / 180;
  const dx = x - PIVOT_X;
  const dy = y - PIVOT_Y;
  return [
    PIVOT_X + Math.cos(r) * dx - Math.sin(r) * dy,
    PIVOT_Y + Math.sin(r) * dx + Math.cos(r) * dy,
  ];
}

/** Pontos do polígono já rotacionado (para renderização estática) */
function staticPoly(angleDeg: number): string {
  const pts: [number, number][] = [
    [97, 146], [103, 146], [111, 56], [89, 56],
  ];
  return pts
    .map(([x, y]) => {
      const [rx, ry] = rotatePoint(x, y, angleDeg);
      return `${rx.toFixed(2)},${ry.toFixed(2)}`;
    })
    .join(" ");
}

// ─── Paletas de páginas (11 tons, esquerda → direita) ─────────────────────────

const PALETTE: Record<string, readonly string[]> = {
  dark: [
    "#282624", "#322F2C", "#3D3A37", "#484441",
    "#534F4B", "#5E5955", "#6A645F", "#78706A",
    "#868070", "#958F7F", "#A39D8D",
  ],
  wine: [
    "#5C2220", "#682826", "#742F2D", "#7F3A37",
    "#8A4140", "#954A48", "#A05452", "#AB5E5C",
    "#B66967", "#C17472", "#CB7F7E",
  ],
  light: [
    "#B9A5A9", "#C2ADB1", "#CBB5B9", "#D1BBBf",
    "#D7C1C5", "#DBC5C8", "#DFC8CB", "#E3CBCE",
    "#E7CDD0", "#E9CFD1", "#EBD1D3",
  ],
};

const R_INK: Record<string, string> = {
  dark:  "#F5F0E8",
  wine:  "#F5F0E8",
  light: "#2A2520",
};

const BG_FILL: Record<string, string | null> = {
  dark:  "#131416",
  wine:  "#5A1E1C",
  light: null,
};

// ─── Componente ───────────────────────────────────────────────────────────────

interface RevelaLogoProps {
  size?: number;
  /**
   * dark  — fundo preto, páginas cinza, "r" creme  (padrão)
   * wine  — fundo vinho, páginas vinho, "r" creme
   * light — sem fundo, páginas rosê-acinzentadas, "r" escuro
   */
  variant?: "dark" | "wine" | "light";
  /**
   * animated=true: ativa folheio SMIL — ideal para o splash.
   * Cada página aparece e gira ao seu ângulo final em cascata rápida.
   */
  animated?: boolean;
  className?: string;
}

const RevelaLogo = ({
  size     = 48,
  variant  = "dark",
  animated = false,
  className = "",
}: RevelaLogoProps) => {
  const pages   = PALETTE[variant] ?? PALETTE.dark;
  const rColor  = R_INK[variant]   ?? R_INK.dark;
  const bgColor = BG_FILL[variant]; // null → sem fundo

  // Ângulo inicial para a animação (todas partem da posição mais à direita)
  const FROM_ANGLE = 15;

  return (
    <svg
      width={size}
      height={Math.round(size * 1.125)}
      viewBox="0 0 200 225"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Revela"
    >
      {/* Fundo (apenas quando definido para a variante) */}
      {bgColor && (
        <rect x="0" y="0" width="200" height="225" rx="16" fill={bgColor} />
      )}

      {/* ── Páginas em leque ────────────────────────────────────────────────── */}
      {PAGE_ANGLES.map((angle, i) =>
        animated ? (
          /* Modo animado: polígono na posição canônica + animateTransform SMIL */
          <polygon
            key={i}
            points={BASE_POLY}
            fill={pages[i]}
            opacity={0}
          >
            {/* 1. Revela a folha instantaneamente no instante do delay */}
            <animate
              attributeName="opacity"
              from="0"
              to="1"
              begin={`${(PAGE_ANGLES.length - 1 - i) * 0.042}s`}
              dur="0.01s"
              fill="freeze"
            />
            {/* 2. Rotaciona da posição fechada (FROM_ANGLE) até o ângulo final */}
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`${FROM_ANGLE} ${PIVOT_X} ${PIVOT_Y}`}
              to={`${angle} ${PIVOT_X} ${PIVOT_Y}`}
              begin={`${(PAGE_ANGLES.length - 1 - i) * 0.042}s`}
              dur="0.38s"
              fill="freeze"
              calcMode="spline"
              keyTimes="0;1"
              keySplines="0.22 1 0.36 1"
            />
          </polygon>
        ) : (
          /* Modo estático: polígono com coords já rotacionadas */
          <polygon key={i} points={staticPoly(angle)} fill={pages[i]} />
        )
      )}

      {/* ── Letra "r" ────────────────────────────────────────────────────────── */}
      {/* Haste vertical */}
      <line
        x1={PIVOT_X} y1={PIVOT_Y}
        x2={PIVOT_X} y2="215"
        stroke={rColor}
        strokeWidth="13"
        strokeLinecap="round"
      />
      {/* Arco do "r": sai da haste em y=161 e curva para a direita */}
      <path
        d={`M ${PIVOT_X},161 C ${PIVOT_X},149 129,148 134,163`}
        stroke={rColor}
        strokeWidth="13"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default RevelaLogo;
