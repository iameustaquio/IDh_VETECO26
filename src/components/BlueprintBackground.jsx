import "./BlueprintBackground.css";

// Fondo técnico tipo "plano de ingeniería": retícula, líneas de cota con
// flechas, anillo de precisión con marcas angulares. Refuerza la
// personalidad "ingeniería, precisión" del documento maestro (punto 7)
// sin caer en fotografía ni en un elemento 3D — es dibujo técnico, no
// decoración gratuita (punto 25, mandatorio: toda animación/elemento con
// propósito).
export function BlueprintBackground({ className = "" }) {
  const ticks = Array.from({ length: 72 });

  return (
    <svg
      className={`blueprint ${className}`.trim()}
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <pattern id="bp-grid-minor" width="25" height="25" patternUnits="userSpaceOnUse">
          <path d="M 25 0 L 0 0 0 25" className="blueprint__grid-minor" />
        </pattern>
        <pattern id="bp-grid-major" width="125" height="125" patternUnits="userSpaceOnUse">
          <rect width="125" height="125" fill="url(#bp-grid-minor)" />
          <path d="M 125 0 L 0 0 0 125" className="blueprint__grid-major" />
        </pattern>
        <marker id="bp-arrow-start" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M1,1 L9,5 L1,9" className="blueprint__arrowhead" />
        </marker>
        <marker id="bp-arrow-end" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M1,1 L9,5 L1,9" className="blueprint__arrowhead" />
        </marker>
      </defs>

      <rect width="1000" height="1000" fill="url(#bp-grid-major)" />

      {/* Marcas de registro en las esquinas, como un plano impreso */}
      {[
        [40, 40],
        [960, 40],
        [40, 960],
        [960, 960],
      ].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`} className="blueprint__reg">
          <line x1={cx - 14} y1={cy} x2={cx + 14} y2={cy} />
          <line x1={cx} y1={cy - 14} x2={cx} y2={cy + 14} />
          <circle cx={cx} cy={cy} r="7" />
        </g>
      ))}

      {/* Anillo de precisión, giro lento vía CSS */}
      <g className="blueprint__ring">
        <circle cx="500" cy="460" r="230" className="blueprint__ring-circle" />
        <circle cx="500" cy="460" r="184" className="blueprint__ring-circle-dashed" />
        {ticks.map((_, i) => (
          <line
            key={i}
            x1="500"
            y1="220"
            x2="500"
            y2={i % 9 === 0 ? "244" : i % 3 === 0 ? "236" : "230"}
            className="blueprint__tick"
            transform={`rotate(${i * 5} 500 460)`}
          />
        ))}
        {[0, 90, 180, 270].map((deg) => (
          <text
            key={deg}
            x="500"
            y="202"
            className="blueprint__tick-label"
            transform={`rotate(${deg} 500 460)`}
          >
            {deg}°
          </text>
        ))}
      </g>

      {/* Líneas de cota */}
      <line x1="150" y1="820" x2="850" y2="820" className="blueprint__dim" markerStart="url(#bp-arrow-start)" markerEnd="url(#bp-arrow-end)" />
      <text x="500" y="806" className="blueprint__dim-label">
        1200 mm
      </text>

      <line x1="130" y1="230" x2="130" y2="690" className="blueprint__dim" markerStart="url(#bp-arrow-start)" markerEnd="url(#bp-arrow-end)" />
      <text x="130" y="212" className="blueprint__dim-label">
        Ø 42 mm
      </text>
    </svg>
  );
}
