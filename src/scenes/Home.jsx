import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Scene1Umbral } from "./Scene1Umbral.jsx";
import { Scene2Problema } from "./Scene2Problema.jsx";
import { Marquee } from "./Marquee.jsx";
import { Scene3Ingenieria } from "./Scene3Ingenieria.jsx";
import { Scene4Escala } from "./Scene4Escala.jsx";
import { Scene5Cierre } from "./Scene5Cierre.jsx";
import "./Home.css";

gsap.registerPlugin(ScrollTrigger);

// Lag (en segundos) del scrub de las transiciones entre escenas — un
// scrub:true clásico ata el tween al scroll bruto 1:1; este valor deja
// que el tween persiga esa posición con una inercia propia notable, más
// fluido y menos "regla milimetrada". Bajado de 0.7 a 0.5 al pasar del
// wipe cinematográfico al "zoom-through" (elegido por el cliente entre
// las opciones presentadas): un empuje de cámara pide una respuesta algo
// más inmediata que el asentamiento lento que pedía el filo diagonal.
const SCRUB_LAG = 0.5;

// HOME — cinco escenas encadenadas por scroll vertical 100% manual
// (documento maestro, sección 24; documento 03, storyboard completo).
//
// Arquitectura de scroll "worldscroll": cada escena se fija en pantalla
// (pin) durante su propio tramo de scroll; la siguiente escena, que sigue
// en flujo normal justo debajo, cruza sobre ella en vez de sustituirla
// con un corte duro. Transición "zoom-through" (madewithgsap.com /
// ciaoenergy.com, elegida por el cliente frente a un wipe con filo
// diagonal y a un revelado fragmentado): sin ningún corte geométrico, la
// escena saliente escala hacia arriba y se desvanece — como si la cámara
// la atravesara — mientras la entrante emerge desde un zoom centrado,
// ambas cruzando en opacidad. Nunca se tocan x/y/rotateX: un empuje de
// cámara es axial, no un deslizamiento ni una inclinación de tarjeta.
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
  const marqueeRef = useRef(null);

  useLayoutEffect(() => {
    const scenes = [scene1Ref, scene2Ref, scene3Ref, scene4Ref, scene5Ref];
    const shells = [shell1Ref, shell2Ref, shell3Ref, shell4Ref, shell5Ref];

    const ctx = gsap.context(() => {
      // GSAP envuelve cada shell fijado en su propio <div class="pin-spacer">
      // (aunque pinSpacing:false no le añada espacio extra) y le copia
      // position/z-index — pero NUNCA su pointer-events. Tocar solo el
      // shell interior (como hacía antes este mismo onToggle) deja ese
      // spacer siempre en pointer-events:auto de fábrica; como cada shell
      // siguiente tiene mayor z-index, su spacer (invisible pero presente)
      // queda por delante del anterior en cualquier zona donde se solapen
      // — típicamente la mitad inferior de la escena activa, justo donde
      // viven los puntos/controles — y se queda con el clic aunque su
      // contenido real esté clipeado a nada. Sincronizar el spacer con su
      // shell en el mismo gsap.set es lo que de verdad soluciona "el
      // clicado a veces falla", no solo el shell.
      const setPointerEvents = (el, value) => {
        gsap.set(el, { pointerEvents: value });
        const parent = el?.parentElement;
        if (parent?.classList.contains("pin-spacer")) gsap.set(parent, { pointerEvents: value });
      };

      shells.forEach((shellRef, i) => {
        const shellEl = shellRef.current;
        const isLast = i === shells.length - 1;
        gsap.set(shellEl, { zIndex: i + 1 });

        if (isLast) {
          setPointerEvents(shellEl, i === 0 ? "auto" : "none");
          return;
        }

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
            setPointerEvents(shellEl, self.isActive ? "auto" : "none");
            setPointerEvents(shells[i + 1].current, self.isActive ? "none" : "auto");
          },
        });

        // Llamada DESPUÉS de crear el ScrollTrigger: el pin-spacer de este
        // shell no existe todavía antes de esta línea (ScrollTrigger.create
        // es quien lo inserta), así que solo aquí setPointerEvents ya
        // puede encontrarlo y sincronizarlo desde el primer render.
        setPointerEvents(shellEl, i === 0 ? "auto" : "none");
      });

      // --- Zoom-through: la cámara "atraviesa" cada escena en vez de que
      // un filo la tape --- la saliente escala hacia arriba y se
      // desvanece/desenfoca, la entrante emerge desde un zoom centrado y
      // llega a foco, ambas cruzando en opacidad. Nunca tocan x/y/rotateX:
      // un empuje de cámara es axial, no un deslizamiento ni una
      // inclinación de tarjeta.
      //
      // Las escenas 2, 3 y 4 tienen DOS fases (entran, luego salen) y
      // viven en UNA sola timeline con UN solo ScrollTrigger (trigger +
      // endTrigger), nunca en dos ScrollTriggers independientes: cada
      // ScrollTrigger, fuera de su propio rango, satura de forma aislada
      // al extremo más cercano (0 o 1) en cuanto se crea — con dos
      // triggers independientes sobre el mismo elemento, ambos saturan
      // "a la vez" nada más crearse (scrollY=0 está antes de los dos
      // rangos) y el que se crea después pisa al primero: la escena
      // aparecía ya asentada (opacity:1) antes incluso de haber entrado,
      // y al llegar realmente a su propio rango de entrada se veía un
      // salto/parpadeo en vez de un fundido gradual. Combinar ambas fases
      // en una timeline con un único progreso 0–1 (vía endTrigger) elimina
      // la ambigüedad: "antes del principio" y "después del final" quedan
      // definidos una sola vez, nunca dos veces en conflicto.
      const ENTER_UNITS = 100; // 100dvh — la propia escena (su shell)
      const DEFAULT_GAP_UNITS = 45; // 45dvh — el .scene-gap antes de la siguiente
      const EXIT_UNITS = 100; // 100dvh — la siguiente escena (su shell)

      // Escena 1: nunca es "entrante" de nadie (es la primera) — solo
      // sale, empujada por la llegada de la escena 2.
      gsap.fromTo(
        scenes[0].current,
        { scale: 1, opacity: 1, filter: "blur(0px)" },
        {
          scale: 1.18,
          opacity: 0,
          filter: "blur(6px)",
          ease: "none",
          scrollTrigger: {
            trigger: shells[1].current,
            start: "top bottom",
            end: "top top",
            // scrub con lag (en vez de scrub:true = 1:1 con el scroll
            // bruto) para que el tween persiga la posición con una pizca
            // de inercia propia — la diferencia entre una transición que
            // "sigue al dedo" y una que se siente fluida. Mismo valor en
            // el resto de tweens de este bloque para que todas crucen
            // siempre exactamente a la par.
            scrub: SCRUB_LAG,
          },
        },
      );

      // Escenas 2, 3 y 4: entrada + salida en una sola timeline. La
      // escena 2 es un caso especial: el marquee (sin pin) vive entre su
      // hueco y la escena 3, así que su salida va ligada a la llegada del
      // marquee, no a la de la escena 3 — y su "meseta" debe cubrir
      // hueco + marquee + hueco (100dvh + 45+45), no un único hueco de
      // 45dvh como el resto de escenas intermedias.
      const MID_TRANSITIONS = [
        { sceneIndex: 1, endTrigger: marqueeRef.current, gapUnits: 45 + 100 + 45 },
        { sceneIndex: 2, endTrigger: shells[3].current, gapUnits: DEFAULT_GAP_UNITS },
        { sceneIndex: 3, endTrigger: shells[4].current, gapUnits: DEFAULT_GAP_UNITS },
      ];

      MID_TRANSITIONS.forEach(({ sceneIndex: k, endTrigger, gapUnits }) => {
        const total = ENTER_UNITS + gapUnits + EXIT_UNITS;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: shells[k].current,
            start: "top bottom",
            endTrigger,
            end: "top top",
            scrub: SCRUB_LAG,
          },
        });
        tl.fromTo(
          scenes[k].current,
          { scale: 0.88, opacity: 0, filter: "blur(8px)" },
          { scale: 1, opacity: 1, filter: "blur(0px)", ease: "none", duration: ENTER_UNITS / total },
          0,
        );
        // fromTo explícito, no .to(): un .to() sin "from" captura su punto
        // de partida del valor ACTUAL del elemento en el momento en que se
        // construye la timeline (aquí, justo después del fromTo de arriba,
        // que ya dejó opacity en 0) — no del valor que tendrá cuando el
        // playhead realmente llegue a este tramo tras la entrada+meseta.
        // Con ese "from" mal capturado (0 en vez de 1), opacity no tenía
        // nada que interpolar y se quedaba plana en 0 durante toda la
        // salida, mientras solo escala seguía moviéndose. Fijar el "from"
        // explícitamente (igual al "to" del tween de entrada) lo evita.
        tl.fromTo(
          scenes[k].current,
          { scale: 1, opacity: 1, filter: "blur(0px)" },
          { scale: 1.18, opacity: 0, filter: "blur(6px)", ease: "none", duration: EXIT_UNITS / total },
          (ENTER_UNITS + gapUnits) / total,
        );
      });

      // Escena 5: nunca es "saliente" de nadie (es la última) — solo
      // entra, empujada por la llegada de su propio shell.
      gsap.fromTo(
        scenes[4].current,
        { scale: 0.88, opacity: 0, filter: "blur(8px)" },
        {
          scale: 1,
          opacity: 1,
          filter: "blur(0px)",
          ease: "none",
          scrollTrigger: {
            trigger: shells[4].current,
            start: "top bottom",
            end: "top top",
            scrub: SCRUB_LAG,
          },
        },
      );

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
      <Marquee sectionRef={marqueeRef} />
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
