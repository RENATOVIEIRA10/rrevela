/**
 * RevelaLogo — "A Abertura"
 *
 * Símbolo da marca Revela: duas linhas em Vellum que partem
 * de um ponto âncora central na base e se abrem suavemente
 * no topo, evocando o ato de abrir um pergaminho ou o véu
 * sendo retirado.
 *
 * Referência: Lucas 24:45 — "Então lhes abriu o entendimento
 * para compreenderem as Escrituras."
 *
 * Uso:
 *   <RevelaLogo />                     → tamanho padrão, cor atual
 *   <RevelaLogo size={64} color="#fff" />
 *   <RevelaLogo variant="badge" />     → com fundo Wine (para splashscreen)
 */
interface RevelaLogoProps {
  size?: number;
  color?: string;
  className?: string;
  /** "mark" = só o símbolo (padrão) | "badge" = símbolo com fundo Wine */
  variant?: "mark" | "badge";
}

const RevelaLogo = ({
  size = 40,
  color = "currentColor",
  className = "",
  variant = "mark",
}: RevelaLogoProps) => {
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
        <rect width="40" height="40" rx="9" fill="#632A26" />
        {/* Linha esquerda */}
        <path
          d="M20 32 Q19.5 23 12.5 7"
          stroke="#F9F7F2"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Linha direita */}
        <path
          d="M20 32 Q20.5 23 27.5 7"
          stroke="#F9F7F2"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Ponto âncora */}
        <circle cx="20" cy="33.2" r="1.1" fill="#F9F7F2" />
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
      {/* Linha esquerda — parte do centro e abre para a esquerda no topo */}
      <path
        d="M20 32 Q19.5 23 12.5 7"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Linha direita — parte do centro e abre para a direita no topo */}
      <path
        d="M20 32 Q20.5 23 27.5 7"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Ponto âncora na base — grounding visual */}
      <circle cx="20" cy="33.2" r="1.1" fill={color} />
    </svg>
  );
};

export default RevelaLogo;
