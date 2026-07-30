import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useLanguage } from "../hooks/useLanguage.js";
import "./Scene4Escala.css";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// Escena 4 — La escala internacional (documento 03). Los marcadores de
// mercado se disponen en arco sobre un globo wireframe (CSS 3D, sin
// WebGL — coherente con el punto 19 del maestro: WebGL solo donde lo
// justifique de verdad, no como base transversal). El globo gira en
// reposo y da un impulso extra al tocar un marcador; un avión vuela de
// un mercado al siguiente con GSAP MotionPathPlugin.
//
// herrajesidh.com/nosotros no es accesible desde este entorno de
// desarrollo, así que marketDetails lleva contenido placeholder hasta
// que se sustituya por el texto real.
const MARKER_POSITIONS = [
  { left: "4%", top: "62%" },
  { left: "26%", top: "16%" },
  { left: "50%", top: "0%" },
  { left: "74%", top: "16%" },
  { left: "96%", top: "62%" },
];

export function Scene4Escala({ sceneRef }) {
  const { t } = useLanguage();
  const [active, setActive] = useState(null);
  const arcRef = useRef(null);
  const globeRef = useRef(null);
  const planeRef = useRef(null);
  const planePos = useRef(null);
  const idleSpin = useRef(null);
  const markerRefs = useRef([]);
  markerRefs.current = [];

  const addMarkerRef = (el) => {
    if (el) markerRefs.current.push(el);
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sceneRef.current,
          start: "top 70%",
          end: "top 20%",
          scrub: true,
        },
      });
      tl.fromTo(
        globeRef.current,
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, ease: "none" },
      ).fromTo(
        markerRefs.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, stagger: 0.2, ease: "none" },
        "<0.1",
      );

      idleSpin.current = gsap.to(globeRef.current, {
        rotateY: "+=360",
        duration: 50,
        ease: "none",
        repeat: -1,
      });
    }, sceneRef);

    return () => ctx.revert();
  }, [sceneRef]);

  const handleMarkerClick = (i) => {
    const next = active === i ? null : i;
    setActive(next);
    if (next === null) return;

    idleSpin.current?.kill();
    gsap.to(globeRef.current, {
      rotateY: `+=${40 + i * 8}`,
      duration: 0.9,
      ease: "back.out(1.6)",
      onComplete: () => {
        idleSpin.current = gsap.to(globeRef.current, {
          rotateY: "+=360",
          duration: 50,
          ease: "none",
          repeat: -1,
        });
      },
    });

    const arcRect = arcRef.current.getBoundingClientRect();
    const markerRect = markerRefs.current[i].getBoundingClientRect();
    const end = {
      x: markerRect.left - arcRect.left + markerRect.width / 2,
      y: markerRect.top - arcRect.top + markerRect.height / 2,
    };
    const start = planePos.current ?? { x: arcRect.width / 2, y: arcRect.height + 40 };
    const lift = Math.min(start.y, end.y) - 70;

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

  return (
    <section className="scene scene--4" ref={sceneRef}>
      <h2 className="scene4__title">{t.home.scene4.title}</h2>
      <p className="scene4__subtitle">{t.home.scene4.subtitle}</p>
      <div className="scene4__stage">
        <div className="scene4__globe-wrap">
          <div className="scene4__globe" ref={globeRef}>
            {[0, 30, 60, 90, 120, 150].map((deg) => (
              <span key={deg} className="scene4__meridian" style={{ transform: `rotateY(${deg}deg)` }} />
            ))}
            <span className="scene4__parallel" style={{ top: "16%", left: "8%", right: "8%", height: "16%" }} />
            <span className="scene4__parallel" style={{ top: "50%", left: "0%", right: "0%", height: "22%" }} />
            <span className="scene4__parallel" style={{ top: "76%", left: "14%", right: "14%", height: "14%" }} />
          </div>
        </div>
        <div className="scene4__arc" ref={arcRef}>
          <svg className="scene4__plane" ref={planeRef} viewBox="0 0 24 24" width="22" height="22">
            <path
              d="M2 12l19-8-6 8 6 8-19-8zm4.5 0l6.2 2.6L14 12l-1.3-2.6L6.5 12z"
              fill="var(--color-brand-orange)"
            />
          </svg>
          {t.home.scene4.markets.map((market, i) => (
            <button
              type="button"
              key={market}
              className={`scene4__marker${active === i ? " is-active" : ""}`}
              style={MARKER_POSITIONS[i]}
              ref={addMarkerRef}
              onClick={() => handleMarkerClick(i)}
            >
              <span className="scene4__dot" />
              <span className="scene4__name">{market}</span>
            </button>
          ))}
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
