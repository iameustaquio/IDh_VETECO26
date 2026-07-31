import { useMemo } from "react";
import "./BlueprintBackground.css";

// Fondo técnico tipo "plano de ingeniería vivo". Tres familias de
// elementos, todos con su propio ciclo aparecer→mantener→desaparecer,
// desincronizados entre sí (delay negativo) para que el plano se sienta
// infinito:
//  - Cotas: se dibujan con un trazo real (stroke-dashoffset), no con un
//    fundido — el mismo lenguaje que usa cualquier software de CAD al
//    generar un plano.
//  - Arcos de ángulo: abren en abanico de 0° al ángulo final y se
//    vuelven a cerrar (SMIL <animate> sobre el propio "d" del sector).
//  - Bloques isométricos + callouts de material: el vocabulario visual
//    de un CATIA/SolidWorks (wireframe + línea de referencia a una
//    etiqueta de material), pedido explícitamente por el cliente.
//
// La colocación reparte cada elemento en una celda distinta de una
// rejilla 4×4 (con la zona central reservada para el logo/mensaje
// excluida) para que nada se superponga — el problema señalado en la
// versión anterior.

function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function shuffle(arr, rand) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function buildCells() {
  const cells = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const isCenter = r >= 1 && r <= 2 && c >= 1 && c <= 2;
      if (!isCenter) cells.push({ x: c * 250 + 125, y: r * 250 + 125 });
    }
  }
  return cells;
}

const ISO_X = { x: Math.cos(Math.PI / 6), y: Math.sin(Math.PI / 6) };
const ISO_Y = { x: -Math.cos(Math.PI / 6), y: Math.sin(Math.PI / 6) };
const ISO_Z = { x: 0, y: -1 };

function isoPoint(ox, oy, x, y, z, unit) {
  return {
    x: ox + (x * ISO_X.x + y * ISO_Y.x) * unit,
    y: oy + (x * ISO_X.y + y * ISO_Y.y + z * ISO_Z.y) * unit,
  };
}

function buildIsoBox(cx, cy, unit) {
  const w = 1.3;
  const d = 1.3;
  const h = 1.6;
  const ox = cx - ((w * ISO_X.x + d * ISO_Y.x) * unit) / 2;
  const oy = cy + (h * unit) / 2;
  const p = (x, y, z) => isoPoint(ox, oy, x, y, z, unit);
  const corners = {
    a: p(0, 0, 0),
    b: p(w, 0, 0),
    c: p(w, d, 0),
    e: p(0, d, 0),
    a2: p(0, 0, h),
    b2: p(w, 0, h),
    c2: p(w, d, h),
    e2: p(0, d, h),
  };
  const seg = (p1, p2) => ({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y });
  return [
    // base
    seg(corners.a, corners.b),
    seg(corners.b, corners.c),
    seg(corners.c, corners.e),
    seg(corners.e, corners.a),
    // top
    seg(corners.a2, corners.b2),
    seg(corners.b2, corners.c2),
    seg(corners.c2, corners.e2),
    seg(corners.e2, corners.a2),
    // verticals
    seg(corners.a, corners.a2),
    seg(corners.b, corners.b2),
    seg(corners.c, corners.c2),
    seg(corners.e, corners.e2),
    // diagonales de construcción, como el mallado de un wireframe CAD
    seg(corners.a2, corners.c2),
    seg(corners.b2, corners.e2),
    seg(corners.a, corners.c2),
  ];
}

function sectorPath(cx, cy, r, startDeg, sweepDeg) {
  const startRad = (startDeg * Math.PI) / 180;
  const endRad = ((startDeg + sweepDeg) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  const large = sweepDeg > 180 ? 1 : 0;
  return `M ${cx.toFixed(1)} ${cy.toFixed(1)} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r.toFixed(1)} ${r.toFixed(1)} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
}

const MATERIALS = ["ALUMINIO 6063", "ACERO ZINCADO 7MM", "ZAMAK", "CATAFORESIS", "INOX SS", "ACERO 8MM"];

function buildElements() {
  const rand = seededRandom(42);
  const cells = shuffle(buildCells(), rand);
  let cellIndex = 0;
  const nextCell = () => cells[cellIndex++ % cells.length];

  const dims = [];
  for (let i = 0; i < 5; i++) {
    const cell = nextCell();
    const vertical = rand() > 0.5;
    const x = cell.x + (rand() - 0.5) * 60;
    const y = cell.y + (rand() - 0.5) * 60;
    const length = 90 + rand() * 90;
    const value = Math.round(40 + rand() * 900);
    const x1 = vertical ? x : x - length / 2;
    const y1 = vertical ? y - length / 2 : y;
    const x2 = vertical ? x : x + length / 2;
    const y2 = vertical ? y + length / 2 : y;
    dims.push({
      id: `dim-${i}`,
      x1,
      y1,
      x2,
      y2,
      len: Math.hypot(x2 - x1, y2 - y1),
      labelX: vertical ? x + 14 : x,
      labelY: vertical ? y : y - 8,
      label: `${value} mm`,
      duration: 6 + rand() * 4,
      delay: -rand() * 10,
    });
  }

  const arcs = [];
  for (let i = 0; i < 3; i++) {
    const cell = nextCell();
    const cx = cell.x + (rand() - 0.5) * 40;
    const cy = cell.y + (rand() - 0.5) * 40;
    const r = 34 + rand() * 30;
    const start = rand() * 360;
    const sweep = 30 + rand() * 80;
    arcs.push({
      id: `arc-${i}`,
      dZero: sectorPath(cx, cy, r, start, 0.01),
      dFull: sectorPath(cx, cy, r, start, sweep),
      labelX: cx + r * 0.65 * Math.cos(((start + sweep / 2) * Math.PI) / 180),
      labelY: cy + r * 0.65 * Math.sin(((start + sweep / 2) * Math.PI) / 180),
      label: `${Math.round(sweep)}°`,
      duration: 7 + rand() * 4,
      delay: -rand() * 11,
    });
  }

  const blocks = [];
  for (let i = 0; i < 2; i++) {
    const cell = nextCell();
    const cx = cell.x + (rand() - 0.5) * 30;
    const cy = cell.y + (rand() - 0.5) * 30;
    blocks.push({
      id: `block-${i}`,
      segments: buildIsoBox(cx, cy, 46 + rand() * 18),
      duration: 9 + rand() * 5,
      delay: -rand() * 14,
    });
  }

  const callouts = [];
  for (let i = 0; i < 2; i++) {
    const cell = nextCell();
    const dotX = cell.x + (rand() - 0.5) * 50;
    const dotY = cell.y + (rand() - 0.5) * 50;
    const labelDx = (rand() > 0.5 ? 1 : -1) * (70 + rand() * 40);
    callouts.push({
      id: `callout-${i}`,
      dotX,
      dotY,
      labelX: dotX + labelDx,
      labelY: dotY,
      len: Math.abs(labelDx),
      align: labelDx > 0 ? "start" : "end",
      label: MATERIALS[Math.floor(rand() * MATERIALS.length)],
      duration: 8 + rand() * 5,
      delay: -rand() * 12,
    });
  }

  return { dims, arcs, blocks, callouts };
}

export function BlueprintBackground({ className = "" }) {
  const { dims, arcs, blocks, callouts } = useMemo(() => buildElements(), []);

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

      {/* Cotas: se dibujan con trazo real (stroke-dashoffset) en vez de
          fundido, se mantienen un momento y se retraen. */}
      {dims.map((d) => (
        <g key={d.id}>
          <line
            x1={d.x1}
            y1={d.y1}
            x2={d.x2}
            y2={d.y2}
            className="blueprint__dim blueprint__draw"
            style={{ "--bp-len": d.len, "--bp-duration": `${d.duration}s`, "--bp-delay": `${d.delay}s` }}
          />
          <text
            x={d.labelX}
            y={d.labelY}
            className="blueprint__dim-label blueprint__fade"
            style={{ "--bp-duration": `${d.duration}s`, "--bp-delay": `${d.delay}s` }}
          >
            {d.label}
          </text>
        </g>
      ))}

      {/* Arcos de ángulo: abren en abanico de 0° al ángulo final (SMIL
          sobre "d") y se cierran, en vez de solo aparecer ya abiertos. */}
      {arcs.map((a) => (
        <g key={a.id}>
          <path className="blueprint__arc" d={a.dZero}>
            <animate
              attributeName="d"
              values={`${a.dZero};${a.dFull};${a.dFull};${a.dZero};${a.dZero}`}
              keyTimes="0;0.3;0.62;0.85;1"
              dur={`${a.duration}s`}
              begin={`${a.delay}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0;0"
              keyTimes="0;0.3;0.62;0.85;1"
              dur={`${a.duration}s`}
              begin={`${a.delay}s`}
              repeatCount="indefinite"
            />
          </path>
          <text
            x={a.labelX}
            y={a.labelY}
            className="blueprint__tick-label blueprint__fade"
            style={{ "--bp-duration": `${a.duration}s`, "--bp-delay": `${a.delay}s` }}
          >
            {a.label}
          </text>
        </g>
      ))}

      {/* Bloques isométricos — vocabulario de wireframe CAD (CATIA/
          SolidWorks) pedido por el cliente. */}
      {blocks.map((b) => (
        <g
          key={b.id}
          className="blueprint__block blueprint__materialize"
          style={{ "--bp-duration": `${b.duration}s`, "--bp-delay": `${b.delay}s` }}
        >
          {b.segments.map((s, i) => (
            <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />
          ))}
        </g>
      ))}

      {/* Callouts de material: punto de referencia + línea líder +
          etiqueta, como en una ficha técnica anotada. */}
      {callouts.map((c) => (
        <g key={c.id}>
          <circle
            cx={c.dotX}
            cy={c.dotY}
            r="3.5"
            className="blueprint__callout-dot blueprint__fade"
            style={{ "--bp-duration": `${c.duration}s`, "--bp-delay": `${c.delay}s` }}
          />
          <line
            x1={c.dotX}
            y1={c.dotY}
            x2={c.labelX}
            y2={c.labelY}
            className="blueprint__dim blueprint__draw"
            style={{ "--bp-len": c.len, "--bp-duration": `${c.duration}s`, "--bp-delay": `${c.delay}s` }}
          />
          <text
            x={c.labelX + (c.align === "start" ? 8 : -8)}
            y={c.labelY - 6}
            textAnchor={c.align}
            className="blueprint__callout-label blueprint__fade"
            style={{ "--bp-duration": `${c.duration}s`, "--bp-delay": `${c.delay}s` }}
          >
            {c.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
