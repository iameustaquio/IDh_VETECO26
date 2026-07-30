import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "../hooks/useLanguage.js";
import "./Scene4Escala.css";

gsap.registerPlugin(ScrollTrigger);

// Escena 4 — La escala internacional (documento 03). Los marcadores de
// mercado se activan según la posición de scroll, no por toque obligatorio;
// tocar uno lo resalta sin salir de la escena.
export function Scene4Escala({ sceneRef }) {
  const { t } = useLanguage();
  const [active, setActive] = useState(null);
  const lineRef = useRef(null);
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
          scroller: document.querySelector(".home"),
          start: "top 70%",
          end: "top 20%",
          scrub: true,
        },
      });
      tl.fromTo(lineRef.current, { scaleX: 0 }, { scaleX: 1, ease: "none", transformOrigin: "left center" }).fromTo(
        markerRefs.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, stagger: 0.2, ease: "none" },
        "<0.1",
      );
    }, sceneRef);

    return () => ctx.revert();
  }, [sceneRef]);

  return (
    <section className="scene scene--4" ref={sceneRef}>
      <h2 className="scene4__title">{t.home.scene4.title}</h2>
      <p className="scene4__subtitle">{t.home.scene4.subtitle}</p>
      <div className="scene4__map">
        <div className="scene4__line" ref={lineRef} />
        {t.home.scene4.markets.map((market, i) => (
          <button
            type="button"
            key={market}
            className={`scene4__marker${active === i ? " is-active" : ""}`}
            ref={addMarkerRef}
            onClick={() => setActive(active === i ? null : i)}
          >
            <span className="scene4__dot" />
            <span className="scene4__name">{market}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
