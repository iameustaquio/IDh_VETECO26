import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import logoIdh from "../assets/brand/logo-idh.svg";
import { BlueprintBackground } from "../components/BlueprintBackground.jsx";
import { LanguageSwitcher } from "../components/LanguageSwitcher.jsx";
import { useLanguage } from "../hooks/useLanguage.js";
import "./Scene1Umbral.css";

// Escena 1 — El umbral (documento 03, storyboard). Ritmo más lento del HOME:
// el logo se disuelve con leve escala ascendente y el mensaje aparece
// palabra a palabra. El indicador "desliza" solo aparece tras 2s de
// inactividad para no interrumpir si el comercial ya ha empezado a hablar.
// El anillo técnico de fondo (SVG, giro casi imperceptible por CSS) es el
// único elemento decorativo — aporta profundidad e ingeniería sin romper
// el silencio visual del punto 10 del maestro.
export function Scene1Umbral({ sceneRef }) {
  const { t } = useLanguage();
  const logoRef = useRef(null);
  const wordsRef = useRef(null);
  const hintRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        logoRef.current,
        { opacity: 0, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.4, ease: "power1.out" },
      );

      const words = wordsRef.current.querySelectorAll("span");
      gsap.fromTo(
        words,
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          delay: 0.3,
          ease: "power1.out",
        },
      );

      const hintTimer = gsap.delayedCall(2, () => {
        gsap.to(hintRef.current, { opacity: 1, duration: 0.4 });
      });

      return () => hintTimer.kill();
    }, sceneRef);

    return () => ctx.revert();
  }, [sceneRef]);

  return (
    <section className="scene scene--1" ref={sceneRef}>
      <div className="scene1__glow" />
      <BlueprintBackground />
      <div className="scene1__content">
        <img ref={logoRef} className="scene1__logo" src={logoIdh} alt="IDh — Innovación y Desarrollo de herrajes" />
        <p className="scene1__message" ref={wordsRef}>
          {t.home.scene1.message.split(" ").map((word, i) => (
            <span key={i}>{word} </span>
          ))}
        </p>
      </div>
      <div className="scene1__footer">
        <span className="scene1__hint" ref={hintRef}>
          {t.home.scene1.scrollHint}
        </span>
        <LanguageSwitcher />
      </div>
    </section>
  );
}
