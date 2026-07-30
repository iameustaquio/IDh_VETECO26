import { useRef } from "react";
import { Scene1Umbral } from "./Scene1Umbral.jsx";
import { Scene2Problema } from "./Scene2Problema.jsx";
import { Scene3Ingenieria } from "./Scene3Ingenieria.jsx";
import { Scene4Escala } from "./Scene4Escala.jsx";
import { Scene5Cierre } from "./Scene5Cierre.jsx";
import "./Home.css";

// HOME — cinco escenas encadenadas por scroll vertical 100% manual
// (documento maestro, sección 24; documento 03, storyboard completo).
// Las escenas referencian el scroller por el selector ".home" (no por ref):
// el ref de este div solo se resuelve durante el commit del propio Home,
// que ocurre DESPUÉS del commit de sus hijos, así que un ScrollTrigger
// creado en el useLayoutEffect de una escena hija vería scrollerRef.current
// todavía en null en ese momento.
export function Home() {
  const scene1Ref = useRef(null);
  const scene2Ref = useRef(null);
  const scene3Ref = useRef(null);
  const scene4Ref = useRef(null);
  const scene5Ref = useRef(null);

  return (
    <div className="home">
      <Scene1Umbral sceneRef={scene1Ref} />
      <Scene2Problema sceneRef={scene2Ref} />
      <Scene3Ingenieria sceneRef={scene3Ref} />
      <Scene4Escala sceneRef={scene4Ref} />
      <Scene5Cierre sceneRef={scene5Ref} />
    </div>
  );
}
