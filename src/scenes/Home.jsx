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
          end: "+=100%",
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

        gsap.fromTo(
          sceneEl,
          { scale: 1, y: 0, rotateX: 0, filter: "blur(0px) brightness(1)" },
          {
            scale: 0.8,
            y: -60,
            rotateX: -10,
            filter: "blur(7px) brightness(0.7)",
            ease: "none",
            scrollTrigger: {
              trigger: shells[i + 1].current,
              start: "top bottom",
              end: "top top",
              scrub: true,
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
      <div className="scene-shell" ref={shell2Ref}>
        <Scene2Problema sceneRef={scene2Ref} />
      </div>
      <div className="scene-shell" ref={shell3Ref}>
        <Scene3Ingenieria sceneRef={scene3Ref} />
      </div>
      <div className="scene-shell" ref={shell4Ref}>
        <Scene4Escala sceneRef={scene4Ref} />
      </div>
      <div className="scene-shell" ref={shell5Ref}>
        <Scene5Cierre sceneRef={scene5Ref} />
      </div>
    </div>
  );
}
