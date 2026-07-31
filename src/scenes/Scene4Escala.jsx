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
// (posiciones geográficas reconocibles — cabo, golfo, península — no una
// costa exacta) suavizados con curvas a través de sus puntos medios, un
// truco clásico para conseguir siluetas de "blob" con aspecto natural a
// partir de una lista de vértices simple. Sin acceso a internet en este
// entorno no hay forma de traer un dataset real de costas, así que estas
// coordenadas están construidas a mano a partir de referencias
// geográficas conocidas (mismo espacio 1200×600 que geoToWorld) para que
// los marcadores caigan sobre su continente real, no sobre cualquier
// mancha genérica.
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

const CONTINENT_POINTS = [
  // América del Norte
  [
    [40, 85], [110, 55], [230, 50], [330, 60], [400, 100], [423, 143],
    [400, 190], [334, 217], [300, 205], [283, 203], [285, 255], [265, 265],
    [240, 260], [220, 270], [190, 240], [160, 190], [130, 140], [90, 100],
  ],
  // América del Sur
  [
    [344, 273], [380, 290], [430, 300], [483, 317], [470, 360], [440, 420],
    [410, 460], [390, 483], [373, 483], [365, 450], [355, 400], [345, 340],
    [335, 300],
  ],
  // Europa
  [
    [555, 200], [560, 170], [580, 150], [593, 120], [610, 90], [640, 70],
    [667, 63], [650, 110], [673, 170], [660, 150], [620, 180],
  ],
  // África
  [
    [580, 190], [600, 210], [650, 215], [700, 220], [720, 250], [770, 267],
    [730, 290], [700, 320], [670, 370], [660, 413], [630, 400], [610, 350],
    [617, 283], [590, 260], [570, 230],
  ],
  // Asia
  [
    [717, 170], [750, 150], [800, 100], [900, 70], [1000, 55], [1100, 60],
    [1167, 67], [1140, 120], [1060, 180], [1000, 200], [953, 260], [900, 280],
    [857, 273], [820, 240], [790, 200], [795, 218], [745, 245], [720, 200],
  ],
  // Oceanía (Australia)
  [
    [930, 380], [977, 373], [1030, 370], [1083, 400], [1083, 427], [1020, 440],
    [960, 420],
  ],
];

const CONTINENT_PATHS = CONTINENT_POINTS.map(smoothPath);

const DRAG_CLICK_THRESHOLD = 6;

export function Scene4Escala({ sceneRef }) {
  const { t } = useLanguage();
  const [active, setActive] = useState(null);
  const stageRef = useRef(null);
  const globeRef = useRef(null);
  const mapRef = useRef(null);
  const planeRef = useRef(null);
  const planePos = useRef(null);
  const idleTween = useRef(null);
  const dragState = useRef({ dragging: false, startX: 0, startTranslate: 0, moved: 0 });
  const markerRefs = useRef([]);

  const setMarkerRef = (i, copy) => (el) => {
    if (!markerRefs.current[i]) markerRefs.current[i] = [];
    markerRefs.current[i][copy] = el;
  };

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

  const flyPlaneTo = (i, copy) => {
    const targetEl = markerRefs.current[i]?.[copy];
    if (!targetEl || !stageRef.current) return;
    const stageRect = stageRef.current.getBoundingClientRect();
    const markerRect = targetEl.getBoundingClientRect();
    const end = {
      x: markerRect.left - stageRect.left + markerRect.width / 2,
      y: markerRect.top - stageRect.top + markerRect.height / 2,
    };
    const start = planePos.current ?? { x: stageRect.width / 2, y: stageRect.height + 30 };
    const lift = Math.min(start.y, end.y) - 90;

    gsap.to(planeRef.current, { opacity: 1, duration: 0.2 });
    gsap.to(planeRef.current, {
      motionPath: {
        path: [start, { x: (start.x + end.x) / 2, y: lift }, end],
        curviness: 1.4,
        autoRotate: true,
      },
      duration: 0.9,
      ease: "power2.inOut",
    });
    planePos.current = end;
  };

  const handleMarkerClick = (i, copy) => {
    if (dragState.current.moved > DRAG_CLICK_THRESHOLD) return;
    const next = active === i ? null : i;
    setActive(next);
    if (next === null) return;
    flyPlaneTo(i, copy);
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
            {MARKET_GEO.map((geo, i) => {
              const { x, y } = geoToWorld(geo);
              const top = `${(y / WORLD_H) * 100}%`;
              return [0, 1].map((copy) => {
                const worldX = x + copy * WORLD_W;
                const left = `${(worldX / (WORLD_W * 2)) * 100}%`;
                return (
                  <button
                    type="button"
                    key={`${i}-${copy}`}
                    className={`scene4__marker${active === i ? " is-active" : ""}`}
                    style={{ left, top }}
                    ref={setMarkerRef(i, copy)}
                    onClick={() => handleMarkerClick(i, copy)}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <span className="scene4__dot" />
                    <span className="scene4__name">{t.home.scene4.markets[i]}</span>
                  </button>
                );
              });
            })}
          </div>
          <div className="scene4__globe-shade" />
        </div>
        <svg className="scene4__plane" ref={planeRef} viewBox="0 0 24 24" width="22" height="22">
          <path d="M2 12l19-8-6 8 6 8-19-8zm4.5 0l6.2 2.6L14 12l-1.3-2.6L6.5 12z" fill="var(--color-brand-orange)" />
        </svg>
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
