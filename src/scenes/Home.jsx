import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Scene1Umbral } from "./Scene1Umbral.jsx";
import { Scene2Problema } from "./Scene2Problema.jsx";
import { Scene3Ingenieria } from "./Scene3Ingenieria.jsx";
import { Scene4Escala } from "./Scene4Escala.jsx";
import { Scene5Cierre } from "./Scene5Cierre.jsx";
import "./Home.css";

gsap.registerPlugin(ScrollTrigger);

// Lag (en segundos) del scrub de las transiciones entre escenas — un
// scrub:true clásico ata el tween al scroll bruto 1:1; este valor deja
// que el tween persiga esa posición con una pizca de inercia propia,
// más "worldscroll" fluido y menos "regla milimetrada".
const SCRUB_LAG = 0.45;

// HOME — cinco escenas encadenadas por scroll vertical 100% manual
// (documento maestro, sección 24; documento 03, storyboard completo).
//
// Arquitectura de scroll "worldscroll": cada escena se fija en pantalla
// (pin) durante su propio tramo de scroll; la siguiente escena, que sigue
// en flujo normal justo debajo, se desliza hacia arriba y la cubre en vez
// de sustituirla con un corte duro. Mientras la cubre, la escena saliente
// se aleja levemente en profundidad (escala, blur, inclinación) — el
// mismo lenguaje de "profundidad sin abusar" que ya usa cada escena por
// separado, aplicado ahora a la transición entre ellas.
//
// El pin y la transformación de salida viven en DOS elementos distintos
// (shell exterior vs. escena interior): GSAP pinea con position:fixed +
// top/left explícitos, y si el mismo elemento recibe además un tween de
// transform (scale/rotateX/y), ambos cálculos interfieren entre sí en
// cadenas de varios pines encadenados — la escena pierde su posición por
// completo pasado el segundo o tercer pin. Separar ambos elementos lo
// resuelve sin renunciar a ninguno de los dos efectos.
export function Home() {
  const homeRef = useRef(null);
  const scene1Ref = useRef(null);
  const scene2Ref = useRef(null);
  const scene3Ref = useRef(null);
  const scene4Ref = useRef(null);
  const scene5Ref = useRef(null);
  const shell1Ref = useRef(null);
  const shell2Ref = useRef(null);
  const shell3Ref = useRef(null);
  const shell4Ref = useRef(null);
  const shell5Ref = useRef(null);

  useLayoutEffect(() => {
    const scenes = [scene1Ref, scene2Ref, scene3Ref, scene4Ref, scene5Ref];
    const shells = [shell1Ref, shell2Ref, shell3Ref, shell4Ref, shell5Ref];

    const ctx = gsap.context(() => {
      shells.forEach((shellRef, i) => {
        const shellEl = shellRef.current;
        const sceneEl = scenes[i].current;
        const isLast = i === shells.length - 1;
        gsap.set(shellEl, { zIndex: i + 1, pointerEvents: i === 0 ? "auto" : "none" });

        if (isLast) return;

        ScrollTrigger.create({
          trigger: shellEl,
          start: "top top",
          // +=145% en vez de +=100%: los 45 puntos extra cubren el
          // .scene-gap insertado en el JSX antes de la siguiente escena —
          // ver nota de la meseta más abajo.
          end: "+=145%",
          pin: true,
          pinSpacing: false,
          // Con pinSpacing:false, la escena siguiente ocupa la misma caja en
          // pantalla que esta (fijada) durante todo su rango de pin, aunque
          // se vea transparente: al tener mayor z-index intercepta cualquier
          // clic en la escena de debajo. Solo la escena realmente activa
          // debe recibir eventos de puntero.
          onToggle: (self) => {
            gsap.set(shellEl, { pointerEvents: self.isActive ? "auto" : "none" });
            gsap.set(shells[i + 1].current, { pointerEvents: self.isActive ? "none" : "auto" });
          },
        });

        // La meseta de nitidez ("solo se lee bien parado en el punto
        // exacto", feedback del cliente) no se consigue retrasando el blur
        // por su cuenta: mientras el shell está fijado, el siguiente sigue
        // en flujo normal y empieza a asomar por abajo desde el primer
        // píxel de scroll (pinSpacing:false). Si el blur se retrasa pero
        // el asomo no, se ven un instante dos escenas nítidas a la vez.
        // La meseta real viene del <div className="scene-gap"> del JSX:
        // un hueco muerto en el flujo que retrasa CUÁNDO empieza a asomar
        // la siguiente escena. Este tween, en cambio, vuelve a ir en
        // sincronía total con ese asomo (start:"top bottom", igual que
        // antes) — por construcción, cubre justo el tramo en el que la
        // siguiente escena entra en cuadro, sea cual sea el largo del hueco.
        gsap.fromTo(
          sceneEl,
          { scale: 1, x: 0, y: 0, rotateX: 0, filter: "blur(0px) brightness(1)" },
          {
            scale: 0.82,
            x: -30,
            y: -70,
            rotateX: -12,
            filter: "blur(8px) brightness(0.65)",
            ease: "none",
            scrollTrigger: {
              trigger: shells[i + 1].current,
              start: "top bottom",
              end: "top top",
              // scrub con lag (en vez de scrub:true = 1:1 con el scroll
              // bruto) para que el tween persiga la posición con una
              // pizca de inercia propia — la diferencia entre una
              // transición que "sigue al dedo" y una que se siente
              // fluida. Mismo valor en los dos tweens de abajo para que
              // blur, filo y asentamiento de la entrante avancen
              // siempre a la par (ver nota de la meseta más arriba).
              scrub: SCRUB_LAG,
            },
          },
        );

        // La escena entrante no solo queda al descubierto por el filo:
        // también se asienta en su sitio (escala levemente hacia 1 e
        // inclinación hacia 0), la misma "profundidad sin abusar" que ya
        // se aplica a la saliente — así ninguna de las dos escenas se
        // siente estática durante la transición. Va en la escena interior
        // de shells[i+1], nunca en su shell (que solo recibe el pin y el
        // clip-path), por la misma razón de siempre.
        gsap.fromTo(
          scenes[i + 1].current,
          { scale: 1.05, rotateX: 4 },
          {
            scale: 1,
            rotateX: 0,
            ease: "none",
            scrollTrigger: {
              trigger: shells[i + 1].current,
              start: "top bottom",
              end: "top top",
              scrub: SCRUB_LAG,
            },
          },
        );

        // Corte diagonal en el borde de entrada de la siguiente escena —
        // en vez de un simple borde horizontal recto (que se sentía como
        // una tarjeta desvaneciéndose), la escena entrante se revela con
        // un filo inclinado tipo "cuchilla", el lenguaje visual típico de
        // un wipe worldscroll. Va en el SHELL (no en la escena interior:
        // ese elemento ya lleva el tween de escala/blur de arriba —
        // mezclar transform y clip-path en el mismo elemento no genera el
        // conflicto de dos pines, pero mantenerlos separados evita
        // cualquier sorpresa) y comparte el mismo disparador que el
        // resto, así que el filo y el blur avanzan exactamente a la par.
        gsap.fromTo(
          shells[i + 1].current,
          { clipPath: "polygon(0% 14%, 100% 0%, 100% 100%, 0% 100%)" },
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            ease: "none",
            scrollTrigger: {
              trigger: shells[i + 1].current,
              start: "top bottom",
              end: "top top",
              scrub: SCRUB_LAG,
            },
          },
        );
      });

      // Nota: se probó un snap global a los límites de cada escena (progreso
      // en incrementos de 1/4), pero en esta arquitectura de pines
      // encadenados (pinSpacing:false) el snap de GSAP resolvía mal el
      // punto más cercano y animaba el scroll de vuelta a 0 casi un segundo
      // después de soltar la rueda — un salto grave, no un ajuste suave. El
      // scroll libre y continuo ya cumple el objetivo "worldscroll"; se
      // retira el snap en vez de mantener ese comportamiento errático.
    }, homeRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="home" ref={homeRef}>
      <div className="scene-shell" ref={shell1Ref}>
        <Scene1Umbral sceneRef={scene1Ref} />
      </div>
      <div className="scene-gap" aria-hidden="true" />
      <div className="scene-shell" ref={shell2Ref}>
        <Scene2Problema sceneRef={scene2Ref} />
      </div>
      <div className="scene-gap" aria-hidden="true" />
      <div className="scene-shell" ref={shell3Ref}>
        <Scene3Ingenieria sceneRef={scene3Ref} />
      </div>
      <div className="scene-gap" aria-hidden="true" />
      <div className="scene-shell" ref={shell4Ref}>
        <Scene4Escala sceneRef={scene4Ref} />
      </div>
      <div className="scene-gap" aria-hidden="true" />
      <div className="scene-shell" ref={shell5Ref}>
        <Scene5Cierre sceneRef={scene5Ref} />
      </div>
    </div>
  );
}
