import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import cr603Image from "../assets/soluciones/manillas/cr603.png";
import cr603kImage from "../assets/soluciones/manillas/cr603k.png";
import { useLanguage } from "../hooks/useLanguage.js";
import "./Scene3Ingenieria.css";

gsap.registerPlugin(ScrollTrigger);

// Escena 3 — La ingeniería detrás (documento 03). Es la única escena del
// HOME donde el documento pide una cámara 3D real (WebGL) sobre la pieza.
// Sin un modelo 3D del herraje disponible todavía, se resuelve con la
// fotografía de producto (recortada de la ficha técnica CR603/CR603K) +
// callouts progresivos. Cuando haya un modelo 3D real, este es el punto
// a revisar.
//
// El texto de cada callout es literal de la ficha CR603/CR603K — sin
// añadidos. El tercer callout (versión con llave) muestra además la
// fotografía recortada de la CR603K.
const CALLOUT_POSITIONS = [{ top: "22%", left: "56%" }, { top: "46%", left: "50%" }, { top: "68%", left: "46%" }];

export function Scene3Ingenieria({ sceneRef }) {
  const { t } = useLanguage();
  const [activeCallout, setActiveCallout] = useState(null);
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

  const callouts = t.home.scene3.callouts;
  const active = activeCallout === null ? null : callouts[activeCallout];

  return (
    <section className="scene scene--3" ref={sceneRef}>
      <h2 className="scene3__title">{t.home.scene3.title}</h2>
      <div className="scene3__body">
        <div className="scene3__stage">
          <img className="scene3__image" src={cr603Image} alt="IDh CR603 — manilla multipunto" />
          {CALLOUT_POSITIONS.map((pos, i) => (
            <button
              key={i}
              type="button"
              className={`scene3__callout${activeCallout === i ? " is-active" : ""}`}
              style={pos}
              ref={addCalloutRef}
              onClick={() => setActiveCallout(activeCallout === i ? null : i)}
              aria-label={callouts[i].title}
            />
          ))}
        </div>
        <div className={`scene3__card${active ? " is-visible" : ""}`}>
          {active ? (
            <>
              <button type="button" className="scene3__card-close" onClick={() => setActiveCallout(null)} aria-label="Cerrar">
                ×
              </button>
              {activeCallout === 2 && (
                <img className="scene3__card-thumb" src={cr603kImage} alt="IDh CR603K — manilla multipunto con llave" />
              )}
              <h3>{active.title}</h3>
              <p>{active.text}</p>
            </>
          ) : (
            <p className="scene3__card-empty">{t.home.scene3.callout}</p>
          )}
        </div>
      </div>
    </section>
  );
}
