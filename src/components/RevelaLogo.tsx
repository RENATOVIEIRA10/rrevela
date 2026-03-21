/**
 * RevelaLogo — "O Caminho que se Bifurca"
 *
 * Símbolo da marca Revela v2: a letra R estilizada cuja perna
 * inferior se bifurca — uma via segue a estrutura (creme),
 * a outra abre um novo caminho (wine). Evoca Lucas 24:45.
 *
 * Uso:
 *   <RevelaLogo />
 *   <RevelaLogo size={64} color="#EDE9E0" accentColor="#8B3D38" />
 *   <RevelaLogo variant="badge" />   → fundo escuro #131416
 */
interface RevelaLogoProps {
  size?: number;
  color?: string;
  /** Cor da bifurcação wine. Padrão: #8B3D38 (dark) */
  accentColor?: string;
  className?: string;
  /** "mark" = só o símbolo | "badge" = símbolo com fundo #131416 */
  variant?: "mark" | "badge";
}

// Geometria do R em viewBox 40×40
// (escala 0.2× da grade de referência 200×200 do Brand Guide v2)
const R_PATHS = {
  // spine: x=11.6, top=6.4, bottom=34.8
  spineX: 11.6,
  topY: 6.4,
  botY: 34.8,
  // bowl: bezier de (11.6,6.4) para (11.6,22) via cp (31,6.4) e (31,22)
  bowlD: "M11.6,6.4 C31,6.4 31,22 11.6,22",
  // shoulder: (11.6,22) → (16.8,22)
  shoulderX1: 11.6, shoulderY: 22, shoulderX2: 16.8,
  // leg: (16.8,22) → fork point (22.8,29.8)
  legX1: 16.8, legY1: 22, forkX: 22.8, forkY: 29.8,
  // left fork: (22.8,29.8) → (21.6,34.8)
  lfX: 21.6, lfY: 34.8,
  // right fork (wine accent): (22.8,29.8) → (30,34.8)
  rfX: 30, rfY: 34.8,
};

const SW = 1.55; // stroke-width

const RMark = ({ color, accentColor }: { color: string; accentColor: string }) => (
  <>
    {/* Spine */}
    <line
      x1={R_PATHS.spineX} y1={R_PATHS.topY}
      x2={R_PATHS.spineX} y2={R_PATHS.botY}
      stroke={color} strokeWidth={SW} strokeLinecap="round"
    />
    {/* Bowl */}
    <path
      d={R_PATHS.bowlD}
      stroke={color} strokeWidth={SW} fill="none" strokeLinecap="round" strokeLinejoin="round"
    />
    {/* Shoulder */}
    <line
      x1={R_PATHS.shoulderX1} y1={R_PATHS.shoulderY}
      x2={R_PATHS.shoulderX2} y2={R_PATHS.shoulderY}
      stroke={color} strokeWidth={SW} strokeLinecap="round"
    />
    {/* Leg to fork */}
    <line
      x1={R_PATHS.legX1} y1={R_PATHS.legY1}
      x2={R_PATHS.forkX} y2={R_PATHS.forkY}
      stroke={color} strokeWidth={SW} strokeLinecap="round"
    />
    {/* Left fork */}
    <line
      x1={R_PATHS.forkX} y1={R_PATHS.forkY}
      x2={R_PATHS.lfX}   y2={R_PATHS.lfY}
      stroke={color} strokeWidth={SW} strokeLinecap="round"
    />
    {/* Right fork — wine accent */}
    <line
      x1={R_PATHS.forkX} y1={R_PATHS.forkY}
      x2={R_PATHS.rfX}   y2={R_PATHS.rfY}
      stroke={accentColor} strokeWidth={SW} strokeLinecap="round"
    />
    {/* Accent dot at tip of right fork */}
    <circle cx={R_PATHS.rfX} cy={R_PATHS.rfY} r="1" fill={accentColor} opacity="0.85" />
  </>
);

const RevelaLogo = ({
  size = 40,
  color = "currentColor",
  accentColor = "#8B3D38",
  className = "",
  variant = "mark",
}: RevelaLogoProps) => {
  if (variant === "badge") {
    return (
      <svg
        width={size} height={size}
        viewBox="0 0 40 40" fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Revela"
      >
        <rect width="40" height="40" rx="4" fill="#131416" />
        <RMark color="#EDE9E0" accentColor="#8B3D38" />
      </svg>
    );
  }

  return (
    <svg
      width={size} height={size}
      viewBox="0 0 40 40" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Revela"
    >
      <RMark color={color} accentColor={accentColor} />
    </svg>
  );
};

export default RevelaLogo;
