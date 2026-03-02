/**
 * Revela Logo — "A Abertura"
 * Duas linhas verticais que se afastam no topo,
 * sugerindo o ato de abrir um pergaminho / véu sendo retirado.
 */
const RevelaLogo = ({
  size = 40,
  color = "currentColor",
  className = "",
}: {
  size?: number;
  color?: string;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Revela logo"
  >
    {/* Left line — curves outward at top */}
    <path
      d="M15 34 L15 18 Q15 8 10 4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Right line — curves outward at top */}
    <path
      d="M25 34 L25 18 Q25 8 30 4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default RevelaLogo;
