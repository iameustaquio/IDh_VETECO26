// Tokens de movimiento — reflejan exactamente src/styles/tokens.css (documento 04, sección 7)
// Dos curvas cubren todo el sistema: la filosofía de movimiento (documento maestro, punto 13)
// pide peso e inercia, no un catálogo de easings distintos.

export const ease = {
  out: "cubic-bezier(0.16, 1, 0.3, 1)", // todo lo que entra en pantalla
  inOutSoft: "cubic-bezier(0.4, 0, 0.2, 1)", // transiciones de un estado a otro
};

export const duration = {
  fast: 0.18, // 150–200ms · respuesta táctil inmediata
  base: 0.3, // 250–350ms · patrones A/B, cambios de nivel
  scene: 0.3, // cross-fade entre escenas del HOME
  close: 0.4, // apertura de marca, Salir (patrón D)
};

export const depth = {
  fondo: { blur: 10, scale: 1.08 },
  media: { blur: 2, scale: 1 },
  frontal: { blur: 0, scale: 1.01 },
  overlay: { blur: 20, scale: 1 },
};
