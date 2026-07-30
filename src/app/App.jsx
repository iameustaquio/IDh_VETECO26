import { Home } from "../scenes/Home.jsx";
import { MenuPrincipal } from "../sections/MenuPrincipal.jsx";
import { useStore } from "../state/store.js";
import "./App.css";

// Shell de la app. La pila de navegación decide qué se muestra: pila vacía
// = HOME; primer nivel = menú principal (documento 05, sección 4). Las
// fichas de categoría/detalle (Patrones A/B del documento 03) llegan en la
// siguiente iteración, fuera del alcance de esta primera entrega del HOME.
export function App() {
  const navStack = useStore((state) => state.navStack);

  return <div className="app">{navStack.length === 0 ? <Home /> : <MenuPrincipal />}</div>;
}
