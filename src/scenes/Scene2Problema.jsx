import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import scene2Image from "../assets/home/scene2-carpinteria.jpg";
import scene2Terraza from "../assets/home/scene2-terraza.jpg";
import scene2Montana from "../assets/home/scene2-montana-lago.jpg";
import scene2Torre from "../assets/home/scene2-torre-dubai.jpg";
import scene2Salon from "../assets/home/scene2-salon-dubai.jpg";
import { useLanguage } from "../hooks/useLanguage.js";
import "./Scene2Problema.css";

gsap.registerPlugin(ScrollTrigger);

// Escena 2 — El problema real (documento 03). Slideshow de proyectos
// reales con la carpintería IDh instalada, enviados por el cliente.
const SLIDES = [
  { image: scene2Image, alt: "Carpintería IDh instalada" },
  { image: scene2Terraza, alt: "Terraza con carpintería corredera IDh" },
  { image: scene2Montana, alt: "Vista a montaña y lago con carpintería corredera IDh" },
  { image: scene2Torre, alt: "Torre residencial con proyecto IDh en Dubái" },
  { image: scene2Salon, alt: "Salón con vistas al Burj Khalifa, proyecto IDh en Dubái" },
];

const AUTOPLAY_MS = 5500;

export function Scene2Problema({ sceneRef }) {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const imageRefs = useRef([]);
  const textRef = useRef(null);

  // Asigna por índice en vez de "push" a la lista: con push, el doble
  // montaje de efectos de StrictMode (monta → limpia → vuelve a montar,
  // sin volver a ejecutar el cuerpo del componente entre medias) vuelve a
  // llamar a los callbacks de ref sin que el array se haya reseteado,
  // duplicando las entradas (acaba con 10 en vez de 5). El efecto de
  // crossfade compara i===active por posición, así que con el array
  // duplicado el elemento real de cada slide queda en el índice
  // equivocado y nunca coincide con "active" — se queda en opacity:0
  // permanentemente. Asignar por índice es idempotente: repetir la
  // asignación en el mismo hueco no cambia la longitud del array.
  const setImageRef = (i) => (el) => {
    if (el) imageRefs.current[i] = el;
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageRefs.current,
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
        imageRefs.current,
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

  useLayoutEffect(() => {
    if (SLIDES.length < 2) return undefined;
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, []);

  useLayoutEffect(() => {
    if (SLIDES.length < 2) return undefined;
    const tweens = imageRefs.current.map((el, i) => {
      if (!el) return null;
      return gsap.to(el, { opacity: i === active ? 1 : 0, duration: 0.9, ease: "power2.inOut" });
    });
    return () => tweens.forEach((tw) => tw?.kill());
  }, [active]);

  return (
    <section className="scene scene--2" ref={sceneRef}>
      <div className="scene2__image-wrap">
        {SLIDES.map((slide, i) => (
          <img
            key={slide.image}
            ref={setImageRef(i)}
            className="scene2__image"
            src={slide.image}
            alt={slide.alt}
            style={{ opacity: i === active ? 1 : 0 }}
          />
        ))}
      </div>
      <p className="scene2__message" ref={textRef}>
        {t.home.scene2.message}
      </p>
      {SLIDES.length > 1 && (
        <div className="scene2__dots">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.image}
              type="button"
              className={`scene2__dot${i === active ? " is-active" : ""}`}
              onClick={() => setActive(i)}
              aria-label={`Proyecto ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
