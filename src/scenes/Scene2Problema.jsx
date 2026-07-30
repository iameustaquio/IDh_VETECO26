import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import scene2Image from "../assets/home/scene2-carpinteria.jpg";
import { useLanguage } from "../hooks/useLanguage.js";
import "./Scene2Problema.css";

gsap.registerPlugin(ScrollTrigger);

// Escena 2 — El problema real (documento 03). Parallax de tres capas
// (fondo arquitectónico, capa media, texto). La fotografía entra con
// escala descendente 105%→100% sincronizada al scroll.
export function Scene2Problema({ sceneRef }) {
  const { t } = useLanguage();
  const imageRef = useRef(null);
  const textRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageRef.current,
        { scale: 1.05, filter: "blur(6px)" },
        {
          scale: 1,
          filter: "blur(0px)",
          ease: "none",
          scrollTrigger: {
            trigger: sceneRef.current,
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        },
      );

      gsap.fromTo(
        imageRef.current,
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: "none",
          scrollTrigger: {
            trigger: sceneRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );

      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: sceneRef.current,
            start: "top 80%",
            end: "top 40%",
            scrub: true,
          },
        },
      );
    }, sceneRef);

    return () => ctx.revert();
  }, [sceneRef]);

  return (
    <section className="scene scene--2" ref={sceneRef}>
      <div className="scene2__image-wrap">
        <img ref={imageRef} className="scene2__image" src={scene2Image} alt="" />
      </div>
      <p className="scene2__message" ref={textRef}>
        {t.home.scene2.message}
      </p>
    </section>
  );
}
