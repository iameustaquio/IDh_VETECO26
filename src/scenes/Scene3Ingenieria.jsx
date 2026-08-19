import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import cr603Image from "../assets/soluciones/manillas/cr603.png";
import cr603kImage from "../assets/soluciones/manillas/cr603k.png";
import cr601Image from "../assets/soluciones/manillas/cr601.png";
import cr606Image from "../assets/soluciones/manillas/cr606.png";
import cr603dImage from "../assets/soluciones/manillas/cr603d.png";
import jm6Image from "../assets/soluciones/manillas/jm6.png";
import { Cr603Exploded } from "../components/Cr603Exploded.jsx";
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

// El despiece de la escena (Cr603Exploded) es de la CR603 — así que el
// carrusel entra ya centrado en ella, no en el primer producto de la
// lista: el montaje termina exactamente en la foto a la que da paso, sin
// un salto de producto justo al entregar el testigo.
const CR603_INDEX = PRODUCTS.findIndex((p) => p.image === cr603Image);

export function Scene3Ingenieria({ sceneRef }) {
  const { t } = useLanguage();
  const [activeProduct, setActiveProduct] = useState(CR603_INDEX);
  const [activeCallout, setActiveCallout] = useState(null);
  const calloutRefs = useRef([]);
  const slideRefs = useRef([]);
  const carouselRef = useRef(null);
  const cardRef = useRef(null);
  const explodedRef = useRef(null);
  const explodedPieceRefs = useRef([]);
  const carouselWrapRef = useRef(null);
  const orbitTween = useRef(null);
  const posTween = useRef(null);
  const posRef = useRef(CR603_INDEX);
  const targetRef = useRef(CR603_INDEX);
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

  // Antesala del carrusel (feedback del cliente, segunda vuelta): la
  // pieza compactada se despliega en su despiece real al hacer scroll y
  // vuelve a compactarse antes de disolverse en el carrusel — no una
  // convergencia desde el arranque (esa primera versión no se leía como
  // animación en absoluto). Piezas SIEMPRE opacas (nunca fade in/out) y
  // en pura traslación vertical (sin scale ni rotación): es un despiece
  // técnico deslizando sobre su propio eje, no un efecto gráfico — así
  // se ve también en el plano CATIA de origen. Mismo trigger que antes
  // movía solo los callouts, ahora con cinco fases en una sola timeline:
  // 1) despliegue (explosión), 2) pausa breve para que se lea el
  // conjunto, 3) recompactado, 4) pulso de cierre, 5) disolución hacia
  // el carrusel real (ya centrado en la CR603) + callouts, igual que
  // antes.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const pieces = explodedPieceRefs.current;
      const manilla = pieces[0];

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sceneRef.current,
          start: "top 70%",
          // Rango generoso a propósito: una timeline en scrub reparte su
          // duración TOTAL sobre este rango en píxeles pase lo que pase,
          // así que al pasar de "solo converge" (1 fase) a "despliega,
          // pausa, recompacta" (3 fases más el cruce final) sin ampliar
          // el rango, cada fase quedó con MENOS scroll que antes, no más
          // — el conjunto se leía incluso peor que la primera versión.
          end: "top -220%",
          scrub: true,
        },
      });

      // Orden de montaje real: primero lo que se apoya directamente sobre
      // la manilla (carcasa + su tornillería), luego hacia fuera (tapa,
      // alfombrilla, muelle, piñón) y por último el tornillo que cierra
      // el conjunto — el mismo orden en el que un montador real lo haría,
      // no el orden en que aparecen los índices del array. El despliegue
      // usa el orden inverso (desmontar empieza por el tornillo, no por
      // la carcasa) para que la lectura sea mecánicamente coherente en
      // los dos sentidos, no solo en el de recompactado.
      const ASSEMBLY_ORDER = [4, 5, 2, 3, 1, 6, 7];
      const DISASSEMBLY_ORDER = [...ASSEMBLY_ORDER].reverse();
      const EXPLODE_DY = { 4: -18, 5: -18, 2: -26, 3: -42, 1: -59, 6: -78, 7: -98 };
      const PIECE_DURATION = 0.5;
      const PIECE_STAGGER = 0.08;
      const explodeSpan = (DISASSEMBLY_ORDER.length - 1) * PIECE_STAGGER + PIECE_DURATION;
      const HOLD = 0.35;

      gsap.set(manilla, { opacity: 1 });
      // Estado de partida = estado de reposo real (piezas en y:0, opacas):
      // a diferencia de la versión anterior, aquí no hace falta "primar"
      // nada por delante del scrollTrigger — un despiece que empieza
      // compacto y opaco ya es, por definición, su propio estado inicial.
      pieces.forEach((el) => el && gsap.set(el, { y: 0, opacity: 1, scale: 1 }));

      DISASSEMBLY_ORDER.forEach((idx, i) => {
        const el = pieces[idx];
        if (!el) return;
        tl.fromTo(
          el,
          { y: 0 },
          { y: EXPLODE_DY[idx], duration: PIECE_DURATION, ease: "power2.out" },
          i * PIECE_STAGGER,
        );
      });

      ASSEMBLY_ORDER.forEach((idx, i) => {
        const el = pieces[idx];
        if (!el) return;
        tl.to(el, { y: 0, duration: PIECE_DURATION, ease: "power2.inOut" }, explodeSpan + HOLD + i * PIECE_STAGGER);
      });

      tl.fromTo(explodedRef.current, { scale: 1 }, { scale: 1.04, duration: 0.14, ease: "power1.out", yoyo: true, repeat: 1 }, "-=0.1");

      tl.to(explodedRef.current, { opacity: 0, duration: 0.5, ease: "power1.inOut" }, "+=0.1");
      tl.fromTo(
        carouselWrapRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: "power1.inOut" },
        "<",
      );

      gsap.set(calloutRefs.current, { opacity: 0, scale: 0 });
      tl.fromTo(
        calloutRefs.current,
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, stagger: 0.3, ease: "none" },
        "-=0.1",
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
        <div className="scene3__exploded" ref={explodedRef} aria-hidden="true">
          <Cr603Exploded className="scene3__exploded-svg" groupRefs={explodedPieceRefs} />
        </div>
        <div className="scene3__carousel-content" ref={carouselWrapRef}>
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
