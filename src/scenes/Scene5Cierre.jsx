import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import logoIdh from "../assets/brand/logo-idh.svg";
import { Button } from "../components/Button.jsx";
import { useLanguage } from "../hooks/useLanguage.js";
import { useStore } from "../state/store.js";
import "./Scene5Cierre.css";

gsap.registerPlugin(ScrollTrigger);

// Escena 5 — El umbral de salida (documento 03). Cierra el círculo visual
// con la misma planitud y ritmo lento de la Escena 1. El botón de acceso
// al menú es el elemento táctil de mayor tamaño de todo el HOME.
export function Scene5Cierre({ sceneRef }) {
  const { t } = useLanguage();
  const enter = useStore((state) => state.enter);
  const contentRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, scale: 0.98 },
        {
          opacity: 1,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sceneRef.current,
            scroller: document.querySelector(".home"),
            start: "top 90%",
            end: "top 50%",
            scrub: true,
          },
        },
      );
    }, sceneRef);

    return () => ctx.revert();
  }, [sceneRef]);

  return (
    <section className="scene scene--5" ref={sceneRef}>
      <div className="scene5__content" ref={contentRef}>
        <img className="scene5__logo" src={logoIdh} alt="IDh — Innovación y Desarrollo de herrajes" />
        <p className="scene5__message">{t.home.scene5.message}</p>
        <Button variant="primary" onClick={() => enter("menu")}>
          {t.home.scene5.cta}
        </Button>
      </div>
    </section>
  );
}
