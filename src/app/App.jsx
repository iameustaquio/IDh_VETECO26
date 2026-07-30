import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { Home } from "../scenes/Home.jsx";
import { MenuPrincipal } from "../sections/MenuPrincipal.jsx";
import { useStore } from "../state/store.js";
import "./App.css";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// Shell de la app. La pila de navegación decide qué se muestra: pila vacía
// = HOME; primer nivel = menú principal (documento 05, sección 4). Las
// fichas de categoría/detalle (Patrones A/B del documento 03) llegan en la
// siguiente iteración, fuera del alcance de esta primera entrega del HOME.
//
// ScrollSmoother envuelve toda la app (no solo el HOME) para dar inercia
// real al scroll — la pieza que le faltaba al "worldscroll": los pines
// de las escenas (documento Home.jsx) ya funcionaban por sí solos, pero
// sin este suavizado global el scroll se sentía "de un tirón" en vez de
// continuo. ScrollTrigger detecta ScrollSmoother automáticamente; no
// hace falta tocar la configuración de los pines existentes.
export function App() {
  const navStack = useStore((state) => state.navStack);
  const smootherRef = useRef(null);
  const showingHome = navStack.length === 0;

  useLayoutEffect(() => {
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.2,
      effects: true,
    });
    return () => smootherRef.current?.kill();
  }, []);

  useLayoutEffect(() => {
    smootherRef.current?.scrollTo(0, false);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [showingHome]);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content" className="app">
        {showingHome ? <Home /> : <MenuPrincipal />}
      </div>
    </div>
  );
}
