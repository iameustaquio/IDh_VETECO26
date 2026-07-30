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
// se aleja levemente en profundidad (escala y brillo hacia abajo) — el
// mismo lenguaje de "profundidad sin abusar" que ya usa cada escena por
// separado, aplicado ahora a la transición entre ellas. Un único trigger
// de snap suave (no CSS scroll-snap, que da saltos abruptos) asienta el
// scroll en el inicio de cada escena al soltar.
export function Home() {
  const homeRef = useRef(null);
  const scene1Ref = useRef(null);
  const scene2Ref = useRef(null);
  const scene3Ref = useRef(null);
  const scene4Ref = useRef(null);
  const scene5Ref = useRef(null);

  useLayoutEffect(() => {
    const scenes = [scene1Ref, scene2Ref, scene3Ref, scene4Ref, scene5Ref];

    const ctx = gsap.context(() => {
      scenes.forEach((ref, i) => {
        const el = ref.current;
        const isLast = i === scenes.length - 1;
        gsap.set(el, { zIndex: i + 1 });

        if (isLast) return;

        ScrollTrigger.create({
          trigger: el,
          start: "top top",
          end: "+=100%",
          pin: true,
          pinSpacing: false,
        });

        gsap.fromTo(
          el,
          { scale: 1, filter: "brightness(1)" },
          {
            scale: 0.94,
            filter: "brightness(0.8)",
            ease: "none",
            scrollTrigger: {
              trigger: scenes[i + 1].current,
              start: "top bottom",
              end: "top top",
              scrub: true,
            },
          },
        );
      });

      ScrollTrigger.create({
        trigger: homeRef.current,
        start: "top top",
        end: "bottom bottom",
        snap: {
          snapTo: 1 / (scenes.length - 1),
          duration: { min: 0.3, max: 0.7 },
          ease: "power2.inOut",
        },
      });
    }, homeRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="home" ref={homeRef}>
      <Scene1Umbral sceneRef={scene1Ref} />
      <Scene2Problema sceneRef={scene2Ref} />
      <Scene3Ingenieria sceneRef={scene3Ref} />
      <Scene4Escala sceneRef={scene4Ref} />
      <Scene5Cierre sceneRef={scene5Ref} />
    </div>
  );
}
