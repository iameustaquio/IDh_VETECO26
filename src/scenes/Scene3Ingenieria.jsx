import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import scene3Image from "../assets/home/scene3-manilla.jpg";
import { useLanguage } from "../hooks/useLanguage.js";
import "./Scene3Ingenieria.css";

gsap.registerPlugin(ScrollTrigger);

// Escena 3 — La ingeniería detrás (documento 03). Es la única escena del
// HOME donde el documento pide una cámara 3D real (WebGL) sobre la pieza.
// Sin un modelo 3D del herraje disponible todavía, se resuelve con la
// fotografía de producto + callouts progresivos — mismo objetivo narrativo
// (resaltar puntos de ensayo), sin bloquear esta iteración en un asset que
// aún no existe. Cuando haya un modelo 3D real, este es el punto a revisar.
const CALLOUTS = [{ top: "24%", left: "58%" }, { top: "48%", left: "52%" }, { top: "68%", left: "48%" }];

export function Scene3Ingenieria({ sceneRef }) {
  const { t } = useLanguage();
  const calloutRefs = useRef([]);
  calloutRefs.current = [];

  const addCalloutRef = (el) => {
    if (el) calloutRefs.current.push(el);
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
      tl.fromTo(
        calloutRefs.current,
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, stagger: 0.3, ease: "none" },
      );
    }, sceneRef);

    return () => ctx.revert();
  }, [sceneRef]);

  return (
    <section className="scene scene--3" ref={sceneRef}>
      <h2 className="scene3__title">{t.home.scene3.title}</h2>
      <div className="scene3__stage">
        <img className="scene3__image" src={scene3Image} alt="Manilla IDh — detalle de ingeniería" />
        {CALLOUTS.map((pos, i) => (
          <span key={i} className="scene3__callout" style={pos} ref={addCalloutRef} />
        ))}
      </div>
      <p className="scene3__label">{t.home.scene3.callout}</p>
    </section>
  );
}
