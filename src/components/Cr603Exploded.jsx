// Ilustración de la manilla CR603 a partir del despiece real (plano CATIA
// del cliente, CR603-X): simplificada a las piezas que se leen a esta
// escala — la manilla y la carcasa (las dos que forman la silueta visible
// del producto ya montado), la tapa, el piñón, la alfombrilla y el
// tornillo como piezas propias, y un cluster para los 8 elementos de
// tornillería menuda (4 muelles de piñón + 4 bolas de 5mm del plano, casi
// indistinguibles entre sí a este tamaño). Vista de perfil, no isométrica
// como el plano de origen — así conecta visualmente con las fotos de
// producto del carrusel (también de perfil) en vez de introducir un
// segundo lenguaje visual justo antes de mostrarlas. Todas las piezas
// pequeñas viven en una columna estrecha alineada con el cuello de la
// manilla (no con el ancho del cuerpo del despiece original) — el plano
// las dibuja mucho más anchas porque tiene toda la hoja para separarlas;
// aquí, apiladas a su ancho real, es lo que evita que la carcasa
// atraviese el brazo en diagonal en vez de asentarse sobre el cuello.
export function Cr603Exploded({ className, groupRefs }) {
  return (
    <svg className={className} viewBox="0 0 320 420" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* 1 — Manilla: la pieza dominante, cuello vertical + brazo en
          diagonal. Nunca se mueve — es el ancla contra la que "encajan"
          el resto de piezas al converger. Va primero (debajo del resto en
          el orden de pintado): así se verificó visualmente antes de
          integrar este componente. */}
      <g ref={(el) => (groupRefs.current[0] = el)}>
        <path
          d="M 148 8
             L 178 8
             C 182 8 185 11 185 15
             L 185 95
             C 185 101 182 106 177 109
             L 88 340
             C 84 350 74 356 64 354
             L 46 350
             C 36 347 30 337 33 327
             L 116 101
             C 119 93 125 86 133 82
             L 143 75
             C 146 73 148 68 148 63
             Z"
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </g>

      {/* 9 — Tornillo */}
      <g ref={(el) => (groupRefs.current[7] = el)}>
        <circle cx="163" cy="18" r="5" fill="none" stroke="var(--color-brand-orange)" strokeWidth="1.6" />
        <path d="M 160 15 L 166 21 M 166 15 L 160 21" stroke="var(--color-brand-orange)" strokeWidth="1.2" />
      </g>

      {/* 8 — Piñón cremona */}
      <g ref={(el) => (groupRefs.current[6] = el)}>
        <rect x="153" y="30" width="20" height="8" rx="2" fill="none" stroke="var(--color-ink)" strokeWidth="1.6" transform="rotate(45 163 34)" />
        <circle cx="163" cy="34" r="4" fill="var(--color-ink)" />
        <rect x="159" y="36" width="8" height="10" fill="none" stroke="var(--color-ink)" strokeWidth="1.4" />
      </g>

      {/* 2 — Muelle de la manilla */}
      <g ref={(el) => (groupRefs.current[1] = el)}>
        <ellipse cx="163" cy="52" rx="13" ry="4" fill="none" stroke="var(--color-brand-blue)" strokeWidth="1.6" />
        <ellipse cx="163" cy="57" rx="13" ry="4" fill="none" stroke="var(--color-brand-blue)" strokeWidth="1.6" />
        <ellipse cx="163" cy="62" rx="13" ry="4" fill="none" stroke="var(--color-brand-blue)" strokeWidth="1.6" />
      </g>

      {/* 4 — Alfombrilla */}
      <g ref={(el) => (groupRefs.current[3] = el)}>
        <rect x="151" y="68" width="24" height="10" rx="5" fill="none" stroke="var(--color-brand-blue)" strokeWidth="1.6" />
      </g>

      {/* 3 — Tapa */}
      <g ref={(el) => (groupRefs.current[2] = el)}>
        <rect x="145" y="80" width="36" height="12" rx="6" fill="none" stroke="var(--color-ink)" strokeWidth="1.8" />
      </g>

      {/* 6+7 — Tornillería menuda (4 muelles de piñón + 4 bolas 5mm del
          plano, agrupadas — no 8 piezas propias) */}
      <g ref={(el) => (groupRefs.current[5] = el)}>
        <circle cx="192" cy="103" r="3" fill="var(--color-brand-orange)" />
        <circle cx="194" cy="112" r="3" fill="var(--color-brand-orange)" />
        <circle cx="190" cy="120" r="3" fill="var(--color-brand-orange)" />
        <circle cx="134" cy="108" r="3" fill="var(--color-brand-blue)" />
      </g>

      {/* 5 — Carcasa */}
      <g ref={(el) => (groupRefs.current[4] = el)}>
        <rect x="140" y="95" width="46" height="30" rx="8" fill="none" stroke="var(--color-ink)" strokeWidth="2.2" />
        <circle cx="163" cy="110" r="8" fill="none" stroke="var(--color-ink)" strokeWidth="1.4" />
      </g>
    </svg>
  );
}
