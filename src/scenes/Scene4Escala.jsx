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

const CONTINENT_PATHS = [
  "M 130 110 C 100 90 140 60 190 65 C 230 60 260 80 290 75 C 320 90 300 130 320 150 C 340 180 300 200 310 230 C 290 260 260 240 240 260 C 220 290 190 270 180 240 C 150 220 140 190 120 170 C 100 150 110 125 130 110 Z",
  "M 260 300 C 290 290 320 300 330 330 C 350 360 340 400 350 440 C 355 470 335 500 310 510 C 290 520 270 500 265 470 C 255 430 240 390 245 350 C 245 325 250 310 260 300 Z",
  "M 540 110 C 560 95 590 100 610 110 C 625 120 615 140 600 150 C 615 165 600 180 580 175 C 560 185 545 170 540 150 C 525 140 530 120 540 110 Z",
  "M 545 195 C 580 185 620 190 640 210 C 660 240 650 280 655 320 C 660 360 640 400 615 420 C 595 435 575 415 570 390 C 555 360 540 330 535 295 C 525 260 530 225 545 195 Z",
  "M 655 90 C 700 70 760 65 820 75 C 880 60 950 70 1000 90 C 1030 105 1010 130 1020 150 C 1040 170 1015 190 1030 210 C 1010 230 980 220 960 235 C 940 260 900 250 880 270 C 860 290 830 275 815 255 C 790 260 770 240 760 215 C 730 210 700 200 685 175 C 660 160 645 130 655 90 Z",
  "M 930 400 C 960 390 1000 395 1020 415 C 1035 435 1020 460 995 465 C 965 470 935 455 925 430 C 918 415 920 405 930 400 Z",
];

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
