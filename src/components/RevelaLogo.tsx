/**
 * RevelaLogo — "A Abertura"
 *
 * Brand v2: duas linhas que partem de um ponto âncora central
 * na base e se abrem no topo, com acento Wine.
 *
 * Cores adaptam automaticamente ao modo Contemplação/Descoberta.
 */
import { useTheme } from "@/hooks/useTheme";

interface RevelaLogoProps {
  size?: number;
  color?: string;
  className?: string;
  variant?: "mark" | "badge";
}

const RevelaLogo = ({
  size = 40,
  color,
  className = "",
  variant = "mark",
}: RevelaLogoProps) => {
  const { theme } = useTheme();

  // Cores adaptativas ao modo
  const strokeColor = color || (theme === "dark" ? "#EDE9E0" : "#1A1C1E");
  const accentColor = theme === "dark" ? "#8B3D38" : "#632A26";

  if (variant === "badge") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Revela"
      >
        <rect width="40" height="40" rx="4" fill="#632A26" />
        <path
          d="M20 32 Q19.5 23 12.5 7"
          stroke="#EDE9E0"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M20 32 Q20.5 23 27.5 7"
          stroke="#8B3D38"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="20" cy="33.2" r="1.1" fill="#EDE9E0" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Revela"
    >
      <path
        d="M20 32 Q19.5 23 12.5 7"
        stroke={strokeColor}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M20 32 Q20.5 23 27.5 7"
        stroke={accentColor}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="20" cy="33.2" r="1.1" fill={strokeColor} />
    </svg>
  );
};

export default RevelaLogo;
