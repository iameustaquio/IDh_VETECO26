import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import cr603Image from "../assets/soluciones/manillas/cr603.png";
import cr603kImage from "../assets/soluciones/manillas/cr603k.png";
import cr601Image from "../assets/soluciones/manillas/cr601.png";
import cr606Image from "../assets/soluciones/manillas/cr606.png";
import cr603dImage from "../assets/soluciones/manillas/cr603d.png";
import jm6Image from "../assets/soluciones/manillas/jm6.png";
import { useLanguage } from "../hooks/useLanguage.js";
import "./Scene3Ingenieria.css";

gsap.registerPlugin(ScrollTrigger);

// Escena 3 — La ingeniería detrás (documento 03). Carrusel tipo
// "coverflow": la manilla activa flota centrada (sin caja ni fondo
// blanco detrás — feedback del cliente) y las vecinas asoman más
// pequeñas y desenfocadas a los lados; se navega arrastrando
// horizontalmente (o con las flechas). El texto de cada callout es
// literal de su ficha técnica — sin añadidos.
const PRODUCTS = [
  {
    image: cr601Image,
    alt: "IDh CR601 — Cremona Neo",
    positions: [
      { top: "16%", left: "54%" },
      { top: "58%", left: "60%" },
    ],
  },
  {
    image: cr603Image,
    thumb: cr603kImage,
    thumbCalloutIndex: 2,
    alt: "IDh CR603 — manilla multipunto",
    positions: [
      { top: "22%", left: "56%" },
      { top: "46%", left: "50%" },
      { top: "68%", left: "46%" },
    ],
  },
  {
    image: cr603dImage,
    alt: "IDh CR603-D — manilla acodada multipunto",
    positions: [
      { top: "18%", left: "38%" },
      { top: "62%", left: "66%" },
    ],
  },
  {
    image: cr606Image,
    alt: "IDh CR606 — manilla elevable",
    positions: [
      { top: "14%", left: "56%" },
      { top: "64%", left: "50%" },
    ],
  },
  {
    image: jm6Image,
    alt: "IDh JM6 — juego de manubrios",
    positions: [
      { top: "38%", left: "22%" },
      { top: "58%", left: "78%" },
    ],
  },
];

const DRAG_CLICK_THRESHOLD = 6;

export function Scene3Ingenieria({ sceneRef }) {
  const { t } = useLanguage();
  const [activeProduct, setActiveProduct] = useState(0);
  const [activeCallout, setActiveCallout] = useState(null);
  const calloutRefs = useRef([]);
  const slideRefs = useRef([]);
  const carouselRef = useRef(null);
  const cardRef = useRef(null);
  const orbitTween = useRef(null);
  const posTween = useRef(null);
  const posRef = useRef(0);
  const targetRef = useRef(0);
  const spacingRef = useRef(300);
  const dragState = useRef({ dragging: false, startX: 0, startPos: 0, moved: 0 });
  calloutRefs.current = [];

  const addCalloutRef = (el) => {
    if (el) calloutRefs.current.push(el);
  };
  const setSlideRef = (i) => (el) => {
    slideRefs.current[i] = el;
  };

  // El espaciado entre manillas se calcula a partir del ancho real del
  // carrusel (no un valor fijo en px) para que en pantallas estrechas las
  // vecinas sigan asomando sin desbordar — clamp entre un mínimo legible
  // y un máximo para no dispersarlas demasiado en pantallas muy anchas.
  const updateSpacing = () => {
    const w = carouselRef.current?.clientWidth ?? 900;
    spacingRef.current = Math.max(130, Math.min(300, w * 0.28));
  };

  // Aplica la posición/escala/blur de cada manilla a partir de una
  // posición continua (puede ser fraccionaria mientras se arrastra) —
  // así el efecto "coverflow" se recalcula en cada frame del arrastre en
  // vez de solo saltar entre estados discretos.
  const render = (pos) => {
    const spacing = spacingRef.current;
    slideRefs.current.forEach((el, i) => {
      if (!el) return;
      const d = i - pos;
      const ad = Math.abs(d);
      const scale = Math.max(0.62, 1 - 0.22 * ad);
      const blur = Math.min(9, ad * 3.6);
      const opacity = Math.max(0.18, 1 - 0.4 * ad);
      const rotateY = Math.max(-32, Math.min(32, d * -20));
      gsap.set(el, {
        x: d * spacing,
        scale,
        opacity,
        rotateY,
        filter: `blur(${blur}px)`,
        zIndex: 100 - Math.round(ad * 10),
      });
    });
  };

  useLayoutEffect(() => {
    updateSpacing();
    posRef.current = activeProduct;
    targetRef.current = activeProduct;
    render(activeProduct);
    const onResize = () => {
      updateSpacing();
      render(posRef.current);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Flotación suave y continua de la manilla activa.
  useLayoutEffect(() => {
    const el = slideRefs.current[activeProduct];
    if (!el) return undefined;
    orbitTween.current = gsap.to(el, {
      y: -10,
      duration: 3.2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    return () => orbitTween.current?.kill();
  }, [activeProduct]);

  useLayoutEffect(() => {
    if (activeCallout === null || !cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, scale: 0.9, y: 16 },
      { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "back.out(1.6)" },
    );
  }, [activeCallout, activeProduct]);

  const settleTo = (index) => {
    const clamped = Math.max(0, Math.min(PRODUCTS.length - 1, index));
    targetRef.current = clamped;
    posTween.current?.kill();
    const obj = { v: posRef.current };
    posTween.current = gsap.to(obj, {
      v: clamped,
      duration: 0.5,
      ease: "power3.out",
      onUpdate: () => {
        posRef.current = obj.v;
        render(obj.v);
      },
      onComplete: () => {
        posRef.current = clamped;
        setActiveProduct(clamped);
        setActiveCallout(null);
      },
    });
  };

  const onPointerDown = (e) => {
    posTween.current?.kill();
    orbitTween.current?.kill();
    dragState.current = { dragging: true, startX: e.clientX, startPos: posRef.current, moved: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragState.current.dragging) return;
    const delta = e.clientX - dragState.current.startX;
    dragState.current.moved = Math.max(dragState.current.moved, Math.abs(delta));
    const pos = dragState.current.startPos - delta / spacingRef.current;
    posRef.current = pos;
    render(pos);
  };

  const onPointerUp = () => {
    if (!dragState.current.dragging) return;
    dragState.current.dragging = false;
    settleTo(Math.round(posRef.current));
  };

  // Se basa en targetRef (el destino "en vuelo"), no en el activeProduct
  // confirmado — este último solo se actualiza al completar la animación
  // (medio segundo después), así que clicar las flechas varias veces
  // seguidas antes de que termine acumulaba siempre el mismo destino en
  // vez de avanzar un paso más por cada clic.
  const changeProduct = (direction) => settleTo(targetRef.current + direction);

  const handleCalloutClick = (i) => {
    if (dragState.current.moved > DRAG_CLICK_THRESHOLD) return;
    setActiveCallout(activeCallout === i ? null : i);
  };

  const callouts = t.home.scene3.products[activeProduct].callouts;
  const active = activeCallout === null ? null : callouts[activeCallout];
  const activeProductData = PRODUCTS[activeProduct];

  return (
    <section className="scene scene--3" ref={sceneRef}>
      <h2 className="scene3__title">{t.home.scene3.title}</h2>
      <div
        className="scene3__carousel"
        ref={carouselRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <button
          type="button"
          className="scene3__nav scene3__nav--prev"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => changeProduct(-1)}
          aria-label="Anterior"
        >
          ‹
        </button>
        {PRODUCTS.map((p, i) => (
          <div className="scene3__slide" key={p.image} ref={setSlideRef(i)}>
            <img className="scene3__image" src={p.image} alt={p.alt} draggable="false" />
            {i === activeProduct &&
              p.positions.map((pos, ci) => (
                <button
                  key={`${activeProduct}-${ci}`}
                  type="button"
                  className={`scene3__callout${activeCallout === ci ? " is-active" : ""}`}
                  style={pos}
                  ref={addCalloutRef}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => handleCalloutClick(ci)}
                  aria-label={callouts[ci]?.title}
                />
              ))}
          </div>
        ))}
        <button
          type="button"
          className="scene3__nav scene3__nav--next"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => changeProduct(1)}
          aria-label="Siguiente"
        >
          ›
        </button>
      </div>
      {active && (
        <div className="scene3__card is-visible" ref={cardRef}>
          <button type="button" className="scene3__card-close" onClick={() => setActiveCallout(null)} aria-label="Cerrar">
            ×
          </button>
          {activeProductData.thumb && activeCallout === activeProductData.thumbCalloutIndex && (
            <img className="scene3__card-thumb" src={activeProductData.thumb} alt={`${activeProductData.alt} — variante`} />
          )}
          <h3>{active.title}</h3>
          <p>{active.text}</p>
        </div>
      )}
    </section>
  );
}
