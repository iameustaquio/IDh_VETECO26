import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { BlueprintBackground } from "../components/BlueprintBackground.jsx";
import { LanguageSwitcher } from "../components/LanguageSwitcher.jsx";
import { LogoMark } from "../components/LogoMark.jsx";
import { useLanguage } from "../hooks/useLanguage.js";
import "./Scene1Umbral.css";

const ICON_PIECES = 6;

// Escena 1 — El umbral (documento 03, storyboard). Ritmo más lento del HOME:
// el icono de IDh se monta pieza a pieza (feedback del cliente: "un salto
// de percepción de calidad" — demostrar ingeniería antes de leer una sola
// palabra, no solo decirlo) y el mensaje aparece palabra a palabra. El
// indicador "desliza" solo aparece tras 2s de inactividad para no
// interrumpir si el comercial ya ha empezado a hablar. El anillo técnico
// de fondo (SVG, giro casi imperceptible por CSS) es el único elemento
// decorativo — aporta profundidad e ingeniería sin romper el silencio
// visual del punto 10 del maestro.
export function Scene1Umbral({ sceneRef }) {
  const { t } = useLanguage();
  const iconGroupRef = useRef(null);
  const iconPathRefs = useRef([]);
  const wordmarkRef = useRef(null);
  const taglineRef = useRef(null);
  const wordsRef = useRef(null);
  const hintRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const pieces = iconPathRefs.current.filter(Boolean);
      pieces.forEach((el) => gsap.set(el, { transformOrigin: "50% 50%" }));

      const tl = gsap.timeline();

      // Las piezas del icono llegan cada una desde un ángulo distinto de
      // un círculo alrededor de su posición final (no todas desde el mismo
      // lado, que se leería como un deslizamiento, no un montaje) y
      // encajan con power3 — desaceleración limpia, sin rebote: es una
      // pieza de precisión encajando en tolerancia, no un elemento
      // "juguetón". Cada `<g>` envuelve su `<path>` sin tocarlo: varios de
      // esos paths ya traen su propio transform="matrix(...)" de fábrica
      // (la posición real dentro del icono) y animar esa envoltura en vez
      // del path evita que el tween de GSAP y esa matriz interfieran entre
      // sí.
      pieces.forEach((el, i) => {
        const angle = (i / ICON_PIECES) * Math.PI * 2 + Math.PI / 6;
        const dx = Math.cos(angle) * 34;
        const dy = Math.sin(angle) * 34;
        tl.fromTo(
          el,
          { x: dx, y: dy, opacity: 0, scale: 0.55, rotation: i % 2 === 0 ? 18 : -18 },
          { x: 0, y: 0, opacity: 1, scale: 1, rotation: 0, duration: 0.65, ease: "power3.out" },
          i * 0.09,
        );
      });

      // Pulso al encajar la última pieza: confirma visualmente "esto ha
      // cerrado en su sitio", el mismo tipo de acento que pide el resto
      // del recorrido para las superficies/controles (ver escena 2 y 5).
      tl.fromTo(
        iconGroupRef.current,
        { scale: 1 },
        { scale: 1.06, duration: 0.12, ease: "power1.out", yoyo: true, repeat: 1 },
        "-=0.1",
      );

      tl.fromTo(
        [wordmarkRef.current, taglineRef.current],
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power1.out" },
        "-=0.05",
      );

      const words = wordsRef.current.querySelectorAll("span");
      tl.fromTo(
        words,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power1.out" },
        "-=0.1",
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
        <LogoMark
          className="scene1__logo"
          iconGroupRef={iconGroupRef}
          iconPathRefs={iconPathRefs}
          wordmarkRef={wordmarkRef}
          taglineRef={taglineRef}
        />
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
