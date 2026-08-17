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
  const wrapperRefs = useRef([]);
  const filterRefs = useRef([]);
  const textRef = useRef(null);
  const prevActiveRef = useRef(0);
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
  const setWrapperRef = (i) => (el) => {
    if (el) wrapperRefs.current[i] = el;
  };
  const setDisplacementRef = (i) => (el) => {
    if (!el) return;
    filterRefs.current[i] = { ...filterRefs.current[i], displacement: el };
  };
  const setBlurRef = (i) => (el) => {
    if (!el) return;
    filterRefs.current[i] = { ...filterRefs.current[i], blur: el };
  };

  const scheduleAutoplay = () => {
    clearInterval(autoplayTimerRef.current);
    if (SLIDES.length < 2) return;
    autoplayTimerRef.current = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
  };

  const goNext = () => {
    setActive((i) => (i + 1) % SLIDES.length);
    scheduleAutoplay();
  };

  const goPrev = () => {
    setActive((i) => (i - 1 + SLIDES.length) % SLIDES.length);
    scheduleAutoplay();
  };

  const handleDotClick = (i) => {
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
    const el = wrapperRefs.current[active];
    if (!el) return;
    const raw = (dx / el.offsetWidth) * 100 * 0.9;
    const clamped = Math.max(-60, Math.min(60, raw));
    gsap.set(el, { xPercent: clamped, opacity: 1 - Math.min(0.3, Math.abs(clamped) / 200) });
  };

  const settleDrag = () => {
    const el = wrapperRefs.current[active];
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

  // Transición "disolución de arena": en vez de deslizar, la imagen
  // saliente se desintegra en su sitio (el desplazamiento de feTurbulence
  // la deshace en grano, a la vez que se desenfoca y se desvanece)
  // mientras la entrante se recompone desde ese mismo caos hasta quedar
  // nítida — sin desplazamiento lateral: es un efecto de disolución, no
  // de barrido, así que xPercent solo se usa para devolver la imagen a 0
  // si el gesto de arrastre la había dejado desplazada al soltar.
  //
  // El filtro SVG (scale de feDisplacementMap + stdDeviation de
  // feGaussianBlur) solo se referencia en el wrapper mientras dura la
  // transición (onStart lo activa, onComplete lo quita): un filtro SVG
  // cuesta renderizar tenga o no distorsión visible, así que dejarlo
  // enganchado permanentemente en las 5 imágenes — la mayoría inactivas
  // el 100% del tiempo — desperdiciaría GPU sin ningún beneficio visual.
  useLayoutEffect(() => {
    if (SLIDES.length < 2) return undefined;
    const prevIndex = prevActiveRef.current;
    const tweens = [];
    wrapperRefs.current.forEach((el, i) => {
      if (!el) return;
      const filters = filterRefs.current[i];
      const disp = filters?.displacement;
      const blur = filters?.blur;
      const enableFilter = () => gsap.set(el, { filter: `url(#scene2-dissolve-${i})` });
      const disableFilter = () => gsap.set(el, { filter: "none" });

      if (i === active) {
        gsap.set(el, { xPercent: 0 });
        const tl = gsap.timeline({ onStart: enableFilter, onComplete: disableFilter });
        tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 1.15, ease: "power2.out" }, 0);
        if (disp) tl.fromTo(disp, { attr: { scale: 70 } }, { attr: { scale: 0 }, duration: 1.15, ease: "power2.out" }, 0);
        if (blur) tl.fromTo(blur, { attr: { stdDeviation: 4 } }, { attr: { stdDeviation: 0 }, duration: 1.15, ease: "power2.out" }, 0);
        tweens.push(tl);
      } else if (i === prevIndex && prevIndex !== active) {
        const tl = gsap.timeline({ onStart: enableFilter, onComplete: disableFilter });
        tl.to(el, { opacity: 0, xPercent: 0, duration: 1, ease: "power2.in" }, 0);
        if (disp) tl.to(disp, { attr: { scale: 70 }, duration: 1, ease: "power2.in" }, 0);
        if (blur) tl.to(blur, { attr: { stdDeviation: 4 }, duration: 1, ease: "power2.in" }, 0);
        tweens.push(tl);
      } else {
        gsap.set(el, { opacity: 0, xPercent: 0, filter: "none" });
        if (disp) gsap.set(disp, { attr: { scale: 0 } });
        if (blur) gsap.set(blur, { attr: { stdDeviation: 0 } });
      }
    });
    prevActiveRef.current = active;
    return () => tweens.forEach((tw) => tw?.kill());
  }, [active]);

  return (
    <section className="scene scene--2" ref={sceneRef}>
      {/* Un <filter> por slide (nunca uno compartido): cada uno anima su
          propio scale/stdDeviation de forma independiente durante su
          propia transición, y dos slides pueden estar disolviéndose a la
          vez (saliente + entrante) con progresos distintos. Oculto vía
          width/height:0, nunca display:none — Safari no resuelve
          referencias filter:url(#...) a defs dentro de un SVG con
          display:none. */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          {SLIDES.map((slide, i) => (
            <filter
              key={slide.image}
              id={`scene2-dissolve-${i}`}
              x="-15%"
              y="-15%"
              width="130%"
              height="130%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed={i + 1} result="noise" />
              <feDisplacementMap
                ref={setDisplacementRef(i)}
                in="SourceGraphic"
                in2="noise"
                scale="0"
                xChannelSelector="R"
                yChannelSelector="G"
                result="displaced"
              />
              <feGaussianBlur ref={setBlurRef(i)} in="displaced" stdDeviation="0" />
            </filter>
          ))}
        </defs>
      </svg>
      <div
        className="scene2__image-wrap"
        onPointerDown={onImagePointerDown}
        onPointerMove={onImagePointerMove}
        onPointerUp={onImagePointerUp}
        onPointerCancel={onImagePointerCancel}
      >
        {SLIDES.map((slide, i) => (
          <div key={slide.image} className="scene2__image-filter" ref={setWrapperRef(i)}>
            <img ref={setImageRef(i)} className="scene2__image" src={slide.image} alt={slide.alt} draggable={false} />
          </div>
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
