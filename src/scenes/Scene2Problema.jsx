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
  const prevActiveRef = useRef(0);
  const directionRef = useRef(1);
  const autoplayTimerRef = useRef(null);
  const dragRef = useRef({ active: false, confirmed: false, startX: 0, startY: 0 });

  // Asigna por índice en vez de "push" a la lista: con push, el doble
  // montaje de efectos de StrictMode (monta → limpia → vuelve a montar,
  // sin volver a ejecutar el cuerpo del componente entre medias) vuelve a
  // llamar a los callbacks de ref sin que el array se haya reseteado,
  // duplicando las entradas (acaba con 10 en vez de 5). El efecto de
  // transición compara i===active por posición, así que con el array
  // duplicado el elemento real de cada slide queda en el índice
  // equivocado y nunca coincide con "active" — se queda en opacity:0
  // permanentemente. Asignar por índice es idempotente: repetir la
  // asignación en el mismo hueco no cambia la longitud del array.
  const setImageRef = (i) => (el) => {
    if (el) imageRefs.current[i] = el;
  };

  const scheduleAutoplay = () => {
    clearInterval(autoplayTimerRef.current);
    if (SLIDES.length < 2) return;
    autoplayTimerRef.current = setInterval(() => {
      directionRef.current = 1;
      setActive((i) => (i + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
  };

  const goNext = () => {
    directionRef.current = 1;
    setActive((i) => (i + 1) % SLIDES.length);
    scheduleAutoplay();
  };

  const goPrev = () => {
    directionRef.current = -1;
    setActive((i) => (i - 1 + SLIDES.length) % SLIDES.length);
    scheduleAutoplay();
  };

  const handleDotClick = (i) => {
    directionRef.current = i >= active ? 1 : -1;
    setActive(i);
    scheduleAutoplay();
  };

  // Arrastre horizontal para pasar de una imagen a otra. touch-action:pan-y
  // en el contenedor (CSS) deja que el navegador gestione de forma nativa
  // cualquier gesto vertical (el scroll de la página, la navegación
  // principal del sitio) — aquí solo confirmamos un arrastre propio
  // cuando el movimiento inicial es predominantemente horizontal; si no,
  // "active" pasa a false y soltamos el gesto sin interferir con el
  // scroll ni bloquearlo con preventDefault/setPointerCapture.
  const onImagePointerDown = (e) => {
    dragRef.current = { active: true, confirmed: false, startX: e.clientX, startY: e.clientY };
  };

  const onImagePointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.confirmed) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dy) >= Math.abs(dx)) {
        drag.active = false;
        return;
      }
      drag.confirmed = true;
    }
    const el = imageRefs.current[active];
    if (!el) return;
    const raw = (dx / el.offsetWidth) * 100 * 0.9;
    const clamped = Math.max(-60, Math.min(60, raw));
    gsap.set(el, { xPercent: clamped, opacity: 1 - Math.min(0.3, Math.abs(clamped) / 200) });
  };

  const settleDrag = () => {
    const el = imageRefs.current[active];
    if (el) gsap.to(el, { xPercent: 0, opacity: 1, duration: 0.4, ease: "power2.out" });
  };

  const onImagePointerUp = (e) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    drag.active = false;
    if (!drag.confirmed) return;
    const dx = e.clientX - drag.startX;
    const threshold = 44;
    if (dx <= -threshold) {
      goNext();
    } else if (dx >= threshold) {
      goPrev();
    } else {
      settleDrag();
    }
  };

  const onImagePointerCancel = () => {
    const drag = dragRef.current;
    if (!drag.active) return;
    drag.active = false;
    if (drag.confirmed) settleDrag();
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
    scheduleAutoplay();
    return () => clearInterval(autoplayTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Transición direccional: la imagen entrante desliza desde el lado hacia
  // el que "avanzamos" (derecha si vamos a la siguiente, izquierda si
  // vamos a la anterior) mientras la saliente continúa hacia el lado
  // opuesto — la misma lectura de movimiento que un deslizamiento con el
  // dedo, dispare el cambio el autoplay, un punto o un swipe. Solo toca
  // opacity/xPercent (nunca scale/filter/yPercent, que ya controla en
  // scroll el efecto de "reveal" de más arriba) para no pelear con ese
  // tween mientras la escena sigue fijada en pantalla.
  useLayoutEffect(() => {
    if (SLIDES.length < 2) return undefined;
    const dir = directionRef.current;
    const prevIndex = prevActiveRef.current;
    const tweens = [];
    imageRefs.current.forEach((el, i) => {
      if (!el) return;
      if (i === active) {
        tweens.push(
          gsap.fromTo(
            el,
            { opacity: 0, xPercent: dir * 22 },
            { opacity: 1, xPercent: 0, duration: 1.1, ease: "power3.out" },
          ),
        );
      } else if (i === prevIndex && prevIndex !== active) {
        tweens.push(gsap.to(el, { opacity: 0, xPercent: -dir * 22, duration: 0.95, ease: "power2.inOut" }));
      } else {
        gsap.set(el, { opacity: 0, xPercent: 0 });
      }
    });
    prevActiveRef.current = active;
    return () => tweens.forEach((tw) => tw?.kill());
  }, [active]);

  return (
    <section className="scene scene--2" ref={sceneRef}>
      <div
        className="scene2__image-wrap"
        onPointerDown={onImagePointerDown}
        onPointerMove={onImagePointerMove}
        onPointerUp={onImagePointerUp}
        onPointerCancel={onImagePointerCancel}
      >
        {SLIDES.map((slide, i) => (
          <img
            key={slide.image}
            ref={setImageRef(i)}
            className="scene2__image"
            src={slide.image}
            alt={slide.alt}
            draggable={false}
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
              onClick={() => handleDotClick(i)}
              aria-label={`Proyecto ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
