import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useLanguage } from "../hooks/useLanguage.js";
import "./Scene4Escala.css";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// Escena 4 — La escala internacional (documento 03). El globo es un mapa
// mundi simplificado (continentes estilizados) dibujado dos veces seguidas
// dentro de una ventana circular; arrastrar la esfera desplaza ese mapa
// horizontalmente y, al llegar al final de una copia, se reengancha en la
// otra de forma invisible — el mismo truco que un carrusel infinito, así
// que gira sin costuras aunque se arrastre sin parar. Los marcadores viven
// dentro del globo, en las mismas coordenadas que su continente, y giran
// con él (feedback del cliente: "los puntos deben estar dentro del
// globo... tocando la pantalla haríamos girar el globo"). Sigue sin usar
// WebGL (punto 19 del maestro): es un plano 2D con máscara circular y
// sombreado radial para sugerir curvatura, no una esfera real.
const WORLD_W = 1200;
const WORLD_H = 600;

// Coordenadas aproximadas (lon/lat) de cada mercado, en el mismo orden que
// t.home.scene4.markets / marketDetails.
const MARKET_GEO = [
  { lon: -3.7, lat: 40.4 }, // España (Madrid)
  { lon: -9.1, lat: 38.7 }, // Portugal (Lisboa)
  { lon: -99.1, lat: 19.4 }, // México (CDMX)
  { lon: -77.0, lat: 38.9 }, // Estados Unidos (Washington)
  { lon: 55.3, lat: 25.2 }, // Oriente Medio (Dubái)
];

function geoToWorld({ lon, lat }) {
  return {
    x: WORLD_W / 2 + (lon / 180) * (WORLD_W / 2),
    y: WORLD_H / 2 - (lat / 90) * (WORLD_H / 2),
  };
}

// Contorno de cada continente como una lista de puntos de referencia
// (cabos, golfos, penínsulas reconocibles — no una costa exacta),
// definidos en lon/lat y pasados por geoToWorld — la misma proyección
// que usan los marcadores, así que un continente y sus marcadores nunca
// pueden desalinearse entre sí aunque se ajusten las coordenadas. Sin
// acceso a internet en este entorno no hay forma de traer un dataset
// real de costas (world-atlas/Natural Earth), así que siguen siendo
// referencias geográficas construidas a mano, verificadas por código
// (test de punto en polígono) para que cada marcador caiga dentro de su
// continente real con margen, no sobre cualquier mancha genérica.
// Catmull-Rom → Bézier: a diferencia de un simple suavizado por puntos
// medios (que recorta las puntas y difumina rasgos como Florida o el
// Cuerno de África), esta curva pasa EXACTAMENTE por cada punto de
// referencia, así que las siluetas conservan sus rasgos distintivos.
function smoothPath(points) {
  const n = points.length;
  const at = (i) => points[((i % n) + n) % n];
  let d = `M ${points[0][0]} ${points[0][1]} `;
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2[0]} ${p2[1]} `;
  }
  return `${d}Z`;
}

// Puntos de referencia por continente como [lon, lat] — cabos, golfos,
// penínsulas reconocibles — pasados por la MISMA proyección que los
// marcadores (geoToWorld), así que ambos comparten el mismo sistema de
// coordenadas y no pueden desalinearse entre sí.
const CONTINENT_GEO_POINTS = [
  // América del Norte (incluye México hasta el sur)
  [
    [-165, 62], [-163, 68], [-150, 71], [-141, 70], [-100, 73], [-75, 63],
    [-64, 50], [-53, 47], [-67, 45], [-75, 36], [-80, 26], [-90, 29],
    [-97, 26], [-97, 20], [-90, 15], [-105, 20], [-110, 23], [-115, 29],
    [-124, 40], [-124, 48], [-130, 55],
  ],
  // América del Sur
  [
    [-77, 8], [-58, 8], [-48, 0], [-35, -8], [-38, -16], [-43, -23],
    [-48, -28], [-57, -35], [-62, -42], [-68, -50], [-70, -55], [-72, -50],
    [-73, -40], [-71, -30], [-75, -15], [-81, -6], [-79, 2],
  ],
  // Europa
  [
    [-9.5, 43], [-2, 47], [3, 51], [8, 55], [10, 59], [18, 66], [25, 71],
    [35, 68], [55, 60], [52, 48], [35, 47], [23, 38], [13, 41], [9, 40],
    [4, 43], [-9.5, 36], [-10.8, 39], [-9.8, 42],
  ],
  // África
  [
    [-6, 35], [10, 37], [20, 33], [33, 31], [35, 27], [43, 12], [51, 12],
    [49, 5], [41, -3], [40, -12], [35, -20], [33, -25], [27, -33],
    [18, -34], [14, -22], [12, -9], [13, 2], [9, 4], [-3, 5], [-10, 9],
    [-17, 15], [-16, 21],
  ],
  // Asia (incluye península arábiga e India)
  [
    [30, 42], [35, 40], [40, 41], [48, 45], [55, 42], [60, 55], [65, 70],
    [80, 73], [100, 76], [130, 74], [145, 70], [160, 62], [163, 58],
    [140, 50], [142, 45], [131, 43], [122, 35], [121, 31], [108, 22],
    [108, 10], [103, 2], [95, 5], [92, 16], [88, 22], [80, 13], [77, 8],
    [73, 20], [68, 24], [61, 25], [58, 27], [57, 15], [48, 30], [44, 33],
    [35, 37],
  ],
  // Oceanía (Australia)
  [
    [113, -22], [122, -18], [131, -12], [135, -12], [142, -11], [145, -17],
    [149, -21], [153, -28], [150, -34], [147, -38], [140, -38], [136, -35],
    [131, -32], [115, -34], [113, -26],
  ],
];

const CONTINENT_POINTS = CONTINENT_GEO_POINTS.map((pts) =>
  pts.map(([lon, lat]) => {
    const { x, y } = geoToWorld({ lon, lat });
    return [x, y];
  }),
);

const CONTINENT_PATHS = CONTINENT_POINTS.map(smoothPath);

const DRAG_CLICK_THRESHOLD = 6;

export function Scene4Escala({ sceneRef }) {
  const { t } = useLanguage();
  const [active, setActive] = useState(null);
  const stageRef = useRef(null);
  const globeRef = useRef(null);
  const mapRef = useRef(null);
  const flightPathRef = useRef(null);
  const flightPlaneRef = useRef(null);
  const flightTween = useRef(null);
  const idleTween = useRef(null);
  const dragState = useRef({ dragging: false, startX: 0, startTranslate: 0, moved: 0 });

  const worldPx = () => (mapRef.current?.getBoundingClientRect().width ?? 0) / 2;

  const startIdleSpin = () => {
    idleTween.current?.kill();
    const w = worldPx();
    if (!w) return;
    idleTween.current = gsap.to(mapRef.current, {
      x: `-=${w}`,
      duration: 110,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x) => gsap.utils.wrap(-w, 0)(x)),
      },
    });
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        globeRef.current,
        { opacity: 0, scale: 0.85 },
        {
          opacity: 1,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sceneRef.current,
            start: "top 70%",
            end: "top 30%",
            scrub: true,
          },
        },
      );
      startIdleSpin();
    }, sceneRef);

    return () => {
      idleTween.current?.kill();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneRef]);

  const onPointerDown = (e) => {
    idleTween.current?.kill();
    dragState.current = {
      dragging: true,
      startX: e.clientX,
      startTranslate: gsap.getProperty(mapRef.current, "x"),
      moved: 0,
    };
    globeRef.current.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragState.current.dragging) return;
    const delta = e.clientX - dragState.current.startX;
    dragState.current.moved = Math.max(dragState.current.moved, Math.abs(delta));
    const w = worldPx();
    const raw = dragState.current.startTranslate + delta;
    gsap.set(mapRef.current, { x: w ? gsap.utils.wrap(-w, 0)(raw) : raw });
  };

  const onPointerUp = () => {
    if (!dragState.current.dragging) return;
    dragState.current.dragging = false;
    startIdleSpin();
  };

  // La ruta de vuelo sale siempre de España (nuestra sede) hacia el país
  // clicado — nunca al revés y nunca entre dos países que no sean España,
  // así que solo hace falta un único trazo/avión reutilizado en cada clic,
  // no una gestión de múltiples rutas simultáneas.
  const hideFlight = () => {
    flightTween.current?.kill();
    if (!flightPathRef.current || !flightPlaneRef.current) return;
    gsap.to([flightPathRef.current, flightPlaneRef.current], { opacity: 0, duration: 0.3 });
  };

  const drawFlightTo = (i, copy) => {
    const path = flightPathRef.current;
    const plane = flightPlaneRef.current;
    if (!path || !plane || i === 0) return;

    const origin = geoToWorld(MARKET_GEO[0]);
    const dest = geoToWorld(MARKET_GEO[i]);
    const end = { x: dest.x + copy * WORLD_W, y: dest.y };
    // España también vive en dos copias del mapa (mismo truco de scroll
    // infinito) — se elige la copia de España más cercana a la copia del
    // país clicado, no necesariamente la misma "copy", para que la ruta
    // sea siempre el trazo corto y visible, nunca el que cruza medio mapa.
    const originCopy = Math.abs(origin.x - end.x) <= Math.abs(origin.x + WORLD_W - end.x) ? 0 : 1;
    const start = { x: origin.x + originCopy * WORLD_W, y: origin.y };
    const lift = Math.min(start.y, end.y) - Math.max(60, Math.abs(end.x - start.x) * 0.18);
    const mid = { x: (start.x + end.x) / 2, y: lift };
    const d = `M ${start.x} ${start.y} Q ${mid.x} ${mid.y} ${end.x} ${end.y}`;

    flightTween.current?.kill();
    path.setAttribute("d", d);
    const length = path.getTotalLength();
    const duration = Math.min(1.6, Math.max(0.8, length / 900));

    gsap.set(path, { opacity: 1, strokeDasharray: "9 7", strokeDashoffset: length });
    gsap.set(plane, { opacity: 1 });

    flightTween.current = gsap
      .timeline()
      .to(path, { strokeDashoffset: 0, duration, ease: "power1.inOut" }, 0)
      .to(
        plane,
        { motionPath: { path, autoRotate: true, alignOrigin: [0.5, 0.5] }, duration, ease: "power1.inOut" },
        0,
      )
      .to([path, plane], { opacity: 0, duration: 0.5 }, "+=0.8");
  };

  const handleMarkerClick = (i, copy) => {
    if (dragState.current.moved > DRAG_CLICK_THRESHOLD) return;
    const next = active === i ? null : i;
    setActive(next);
    if (next === null || next === 0) {
      hideFlight();
      return;
    }
    drawFlightTo(next, copy);
  };

  return (
    <section className="scene scene--4" ref={sceneRef}>
      <h2 className="scene4__title">{t.home.scene4.title}</h2>
      <p className="scene4__subtitle">{t.home.scene4.subtitle}</p>
      <div className="scene4__stage" ref={stageRef}>
        <div
          className="scene4__globe"
          ref={globeRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="scene4__map" ref={mapRef}>
            <svg className="scene4__continents" viewBox={`0 0 ${WORLD_W * 2} ${WORLD_H}`} preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <g id="scene4-landmasses">
                  {CONTINENT_PATHS.map((d, i) => (
                    <path key={i} d={d} />
                  ))}
                </g>
              </defs>
              <use href="#scene4-landmasses" x="0" />
              <use href="#scene4-landmasses" x={WORLD_W} />
            </svg>
            <svg
              className="scene4__flight"
              viewBox={`0 0 ${WORLD_W * 2} ${WORLD_H}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path className="scene4__flight-path" ref={flightPathRef} d="" />
              {/* Morro (punta) en +x: autoRotate de MotionPathPlugin asume que a
                  0° de rotación la forma ya apunta hacia +x — dibujarla al
                  revés (morro en -x) hace que el avión apunte siempre en
                  sentido contrario al trazo, sea cual sea el país. */}
              <path className="scene4__flight-plane" ref={flightPlaneRef} d="M 11 0 L -8 -7 L 0 0 L -8 7 Z" />
            </svg>
            {MARKET_GEO.map((geo, i) => {
              const { x, y } = geoToWorld(geo);
              const top = `${(y / WORLD_H) * 100}%`;
              const isHome = i === 0;
              return [0, 1].map((copy) => {
                const worldX = x + copy * WORLD_W;
                const left = `${(worldX / (WORLD_W * 2)) * 100}%`;
                return (
                  <button
                    type="button"
                    key={`${i}-${copy}`}
                    className={`scene4__marker${isHome ? " scene4__marker--home" : ""}${active === i ? " is-active" : ""}`}
                    style={{ left, top }}
                    onClick={() => handleMarkerClick(i, copy)}
                    onPointerDown={(e) => e.stopPropagation()}
                    aria-label={t.home.scene4.markets[i]}
                  >
                    {isHome ? <span className="scene4__home-icon" /> : <span className="scene4__dot" />}
                    <span className="scene4__name">{t.home.scene4.markets[i]}</span>
                  </button>
                );
              });
            })}
          </div>
          <div className="scene4__globe-shade" />
        </div>
      </div>
      <div className={`scene4__card${active !== null ? " is-visible" : ""}`}>
        {active !== null && (
          <>
            <button type="button" className="scene4__card-close" onClick={() => setActive(null)} aria-label="Cerrar">
              ×
            </button>
            <h3>{t.home.scene4.markets[active]}</h3>
            <p>{t.home.scene4.marketDetails[active]}</p>
          </>
        )}
      </div>
    </section>
  );
}
