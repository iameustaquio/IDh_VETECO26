import { useEffect } from "react";
import gsap from "gsap";
import "./TouchReticle.css";

// Confirmación táctil propia en vez de vocabulario de ratón (feedback del
// cliente, punto C): en una pantalla táctil no hay :hover fiable, así que
// nada le confirmaba al comercial "esto ha registrado tu toque" en el
// instante. Un único listener global (no un handler por botón — sería
// repetir la misma lógica en cada componente y fácil de dejar
// desincronizada) escucha pointerdown en fase de captura y, si el
// objetivo es un <button>, dibuja una mira de referencia técnica (el
// mismo lenguaje de las cotas de la escena 1) justo en el punto de
// contacto. Fuera de React a propósito: es un efecto puramente visual,
// de usar y tirar, docenas de veces por demo — gestionarlo como estado de
// React solo añadiría renders sin ningún beneficio. Tamaño (28px) fijado
// también en TouchReticle.css, que centra el elemento sobre el punto de
// contacto vía margin negativo — si se cambia aquí, cambiar también ahí.
function spawnReticle(x, y) {
  const el = document.createElement("div");
  el.className = "touch-reticle";
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.innerHTML =
    '<svg viewBox="0 0 28 28" width="28" height="28"><path d="M14 2 L14 10 M14 18 L14 26 M2 14 L10 14 M18 14 L26 14" /><circle cx="14" cy="14" r="5" /></svg>';
  document.body.appendChild(el);

  gsap.fromTo(
    el,
    { opacity: 1, scale: 0.6 },
    {
      opacity: 0,
      scale: 1.15,
      duration: 0.4,
      ease: "power2.out",
      onComplete: () => el.remove(),
    },
  );
}

export function TouchReticle() {
  useEffect(() => {
    const onPointerDown = (e) => {
      if (!e.target.closest("button")) return;
      spawnReticle(e.clientX, e.clientY);
    };
    document.addEventListener("pointerdown", onPointerDown, { capture: true });
    return () => document.removeEventListener("pointerdown", onPointerDown, { capture: true });
  }, []);

  return null;
}
