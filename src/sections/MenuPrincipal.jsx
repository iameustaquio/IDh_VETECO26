import { useLanguage } from "../hooks/useLanguage.js";
import { useStore } from "../state/store.js";
import "./MenuPrincipal.css";

// Menú principal — placeholder. Las cinco secciones (documento maestro,
// punto 12) todavía no tienen contenido real ni ficha de detalle: esto es
// solo el punto de entrada del Patrón A para que "Explorar el showroom" del
// cierre del HOME tenga a dónde llevar. Construcción real de cada sección,
// en la siguiente iteración (una por una, según el principio rector del
// documento 06: nunca más de un componente importante a la vez).
const SECTIONS = ["proyectos", "soluciones", "novedades", "calidad", "idh"];

export function MenuPrincipal() {
  const { t } = useLanguage();
  const back = useStore((state) => state.back);
  const home = useStore((state) => state.home);
  const exit = useStore((state) => state.exit);

  return (
    <div className="menu-principal">
      <nav className="menu-principal__controls">
        <button type="button" onClick={back}>
          ← {t.nav.back}
        </button>
        <button type="button" onClick={home}>
          {t.nav.home}
        </button>
        <button type="button" onClick={exit}>
          {t.nav.exit}
        </button>
      </nav>
      <div className="menu-principal__grid">
        {SECTIONS.map((section) => (
          <div key={section} className="menu-principal__card">
            {section}
          </div>
        ))}
      </div>
      <p className="menu-principal__note">
        Próxima iteración: contenido real de cada sección (Patrón A / Patrón B, documento 03).
      </p>
    </div>
  );
}
