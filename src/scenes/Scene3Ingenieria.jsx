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

// Escena 3 — La ingeniería detrás (documento 03). Es la única escena del
// HOME donde el documento pide una cámara 3D real (WebGL) sobre la pieza.
// Sin modelos 3D disponibles todavía, se resuelve con un carrusel de
// fotografías de producto reales (recortadas de fichas técnicas, fondo
// eliminado) + callouts progresivos. El texto de cada callout es literal
// de su ficha técnica — sin añadidos.
//
// Cada producto trae sus propias posiciones de callout (coordenadas % del
// punto sobre la fotografía) porque la silueta de cada manilla es
// distinta. Las tarjetas, en cambio, usan un mismo conjunto de 3
// "huecos" fijos dentro del panel — feedback del cliente: que cada
// callout abra su tarjeta en un sitio distinto, no siempre en el mismo.
const PRODUCTS = [
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
    image: cr601Image,
    alt: "IDh CR601 — Cremona Neo",
    positions: [
      { top: "16%", left: "54%" },
      { top: "58%", left: "60%" },
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
    image: cr603dImage,
    alt: "IDh CR603-D — manilla acodada multipunto",
    positions: [
      { top: "18%", left: "38%" },
      { top: "62%", left: "66%" },
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

const CARD_SLOTS = [{ top: "0%" }, { top: "37%" }, { top: "74%" }];

export function Scene3Ingenieria({ sceneRef }) {
  const { t } = useLanguage();
  const [activeProduct, setActiveProduct] = useState(0);
  const [activeCallout, setActiveCallout] = useState(null);
  const calloutRefs = useRef([]);
  const imageRef = useRef(null);
  const cardRef = useRef(null);
  const orbitTween = useRef(null);
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

  // Flotación suave y continua de la fotografía activa — pequeño balanceo
  // vertical + inclinación, para que la pieza se sienta "viva" en reposo
  // en vez de una imagen estática (feedback del cliente).
  useLayoutEffect(() => {
    orbitTween.current = gsap.to(imageRef.current, {
      y: -10,
      rotateZ: 1.4,
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

  const changeProduct = (next) => {
    const total = PRODUCTS.length;
    const nextIndex = (next + total) % total;
    setActiveProduct(nextIndex);
    setActiveCallout(null);
    gsap.fromTo(imageRef.current, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" });
  };

  const product = PRODUCTS[activeProduct];
  const productNames = t.home.scene3.products.map((p) => p.name);
  const callouts = t.home.scene3.products[activeProduct].callouts;
  const active = activeCallout === null ? null : callouts[activeCallout];
  const slot = activeCallout === null ? CARD_SLOTS[0] : CARD_SLOTS[activeCallout % CARD_SLOTS.length];

  return (
    <section className="scene scene--3" ref={sceneRef}>
      <h2 className="scene3__title">{t.home.scene3.title}</h2>
      <div className="scene3__body">
        <div className="scene3__stage">
          <button type="button" className="scene3__nav scene3__nav--prev" onClick={() => changeProduct(activeProduct - 1)} aria-label="Anterior">
            ‹
          </button>
          <img ref={imageRef} className="scene3__image" src={product.image} alt={product.alt} />
          {product.positions.map((pos, i) => (
            <button
              key={`${activeProduct}-${i}`}
              type="button"
              className={`scene3__callout${activeCallout === i ? " is-active" : ""}`}
              style={pos}
              ref={addCalloutRef}
              onClick={() => setActiveCallout(activeCallout === i ? null : i)}
              aria-label={callouts[i]?.title}
            />
          ))}
          <button type="button" className="scene3__nav scene3__nav--next" onClick={() => changeProduct(activeProduct + 1)} aria-label="Siguiente">
            ›
          </button>
        </div>
        <div className="scene3__card-area">
          <div className={`scene3__card${active ? " is-visible" : ""}`} style={slot} ref={cardRef}>
            {active ? (
              <>
                <button type="button" className="scene3__card-close" onClick={() => setActiveCallout(null)} aria-label="Cerrar">
                  ×
                </button>
                {product.thumb && activeCallout === product.thumbCalloutIndex && (
                  <img className="scene3__card-thumb" src={product.thumb} alt={`${product.alt} — variante`} />
                )}
                <h3>{active.title}</h3>
                <p>{active.text}</p>
              </>
            ) : (
              <p className="scene3__card-empty">{t.home.scene3.callout}</p>
            )}
          </div>
        </div>
      </div>
      <div className="scene3__dots">
        {productNames.map((name, i) => (
          <button
            key={name}
            type="button"
            className={`scene3__dot${i === activeProduct ? " is-active" : ""}`}
            onClick={() => changeProduct(i)}
          >
            {name}
          </button>
        ))}
      </div>
    </section>
  );
}
