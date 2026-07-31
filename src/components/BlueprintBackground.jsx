import { useMemo } from "react";
import "./BlueprintBackground.css";

// Fondo técnico tipo "plano de ingeniería vivo": retícula fija de fondo +
// un campo de líneas de cota, arcos angulares y marcas que van apareciendo
// y desapareciendo de forma continua en posiciones distintas del lienzo.
// Sustituye al anillo estático anterior — el objetivo (feedback del
// cliente) es que la cabecera se sienta como un plano infinito que sigue
// revelando trazados mientras el usuario mira, en vez de un elemento fijo
// ya "resuelto" a la primera. Refuerza "ingeniería, precisión" (maestro,
// punto 7) sin caer en fotografía ni 3D (punto 25: toda animación con
// propósito).

function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function buildElements() {
  const rand = seededRandom(42);
  const dims = [];
  const arcs = [];

  for (let i = 0; i < 9; i++) {
    const vertical = rand() > 0.5;
    const x = 90 + rand() * 820;
    const y = 90 + rand() * 820;
    const length = 120 + rand() * 260;
    const value = Math.round(40 + rand() * 900);
    dims.push({
      id: `dim-${i}`,
      vertical,
      x1: vertical ? x : x - length / 2,
      y1: vertical ? y - length / 2 : y,
      x2: vertical ? x : x + length / 2,
      y2: vertical ? y + length / 2 : y,
      labelX: vertical ? x + 16 : x,
      labelY: vertical ? y : y - 10,
      label: `${value} mm`,
      duration: 7 + rand() * 6,
      delay: -rand() * 12,
    });
  }

  for (let i = 0; i < 6; i++) {
    const cx = 100 + rand() * 800;
    const cy = 100 + rand() * 800;
    const r = 40 + rand() * 70;
    const start = rand() * 360;
    const sweep = 30 + rand() * 90;
    const large = sweep > 180 ? 1 : 0;
    const startRad = (start * Math.PI) / 180;
    const endRad = ((start + sweep) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    arcs.push({
      id: `arc-${i}`,
      d: `M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`,
      labelX: cx + r * 0.6 * Math.cos(startRad + (sweep * Math.PI) / 360),
      labelY: cy + r * 0.6 * Math.sin(startRad + (sweep * Math.PI) / 360),
      label: `${Math.round(sweep)}°`,
      duration: 8 + rand() * 7,
      delay: -rand() * 14,
    });
  }

  return { dims, arcs };
}

export function BlueprintBackground({ className = "" }) {
  const { dims, arcs } = useMemo(() => buildElements(), []);

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

      {/* Campo de cotas: aparecen y desaparecen en bucle, cada una con su
          propio ritmo (delay negativo = desincronizado desde el primer
          fotograma), para que el plano se sienta vivo e infinito. */}
      {dims.map((d) => (
        <g key={d.id} className="blueprint__pulse" style={{ "--bp-duration": `${d.duration}s`, "--bp-delay": `${d.delay}s` }}>
          <line x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2} className="blueprint__dim" markerStart="url(#bp-arrow-start)" markerEnd="url(#bp-arrow-end)" />
          <text x={d.labelX} y={d.labelY} className="blueprint__dim-label">
            {d.label}
          </text>
        </g>
      ))}

      {arcs.map((a) => (
        <g key={a.id} className="blueprint__pulse" style={{ "--bp-duration": `${a.duration}s`, "--bp-delay": `${a.delay}s` }}>
          <path d={a.d} className="blueprint__arc" />
          <text x={a.labelX} y={a.labelY} className="blueprint__tick-label">
            {a.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
